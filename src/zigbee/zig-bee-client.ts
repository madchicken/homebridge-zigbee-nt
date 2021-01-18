import { ZigBeeController } from './zigBee-controller';
import { Logger } from 'homebridge';
import { sleep } from '../utils/sleep';
import { MessagePayload } from 'zigbee-herdsman/dist/controller/events';
import { DeferredMessage, PromiseBasedQueue } from '../utils/promise-queue';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import {
  ColorCapabilities,
  DeviceState,
  Meta,
  Options,
  ToConverter,
  ZigBeeControllerConfig,
  ZigBeeEntity,
} from './types';
import { findSerialPort } from '../utils/find-serial-port';
import retry from 'async-retry';

export interface ZigBeeClientConfig {
  channel: number;
  port?: string;
  database: string;
  panId: number;
  secondaryChannel?: string;
  adapter?: 'zstack' | 'deconz' | 'zigate';
}

type StatePublisher = (ieeeAddr: string, state: DeviceState) => void;

export class ZigBeeClient extends PromiseBasedQueue<string, MessagePayload> {
  private readonly zigBee: ZigBeeController;
  private readonly log: Logger;

  constructor(log: Logger) {
    super();
    this.zigBee = new ZigBeeController(this.log);
    this.log = log;
    this.setTimeout(5000);
  }

  async start(config: ZigBeeClientConfig): Promise<boolean> {
    const channels = [config.channel];
    const secondaryChannel = parseInt(config.secondaryChannel);
    if (!isNaN(secondaryChannel) && !channels.includes(secondaryChannel)) {
      channels.push(secondaryChannel);
    }

    const port = config.port || (await findSerialPort());
    this.log.info(`Configured port for ZigBee dongle is ${port}`);
    const initConfig: ZigBeeControllerConfig = {
      port,
      databasePath: config.database,
      panId: config.panId,
      channels,
      adapter: config.adapter || 'zstack',
    };

    this.log.info(
      `Initializing ZigBee controller on port ${
        initConfig.port
      } and channels ${initConfig.channels.join(', ')} (pan ID ${config.panId})`
    );
    this.zigBee.init(initConfig);

    const retrier = async () => {
      try {
        await this.zigBee.start();
        this.log.info('Successfully started ZigBee service');
        return true;
      } catch (error) {
        this.log.error(error);
        await this.zigBee.stop();
        throw error;
      }
    };

    try {
      return await retry(retrier, {
        retries: 20,
        minTimeout: 5000,
        maxTimeout: 5000,
        onRetry: () => this.log.info('Retrying connect to hardware'),
      });
    } catch (error) {
      this.log.info('error:', error);
      return false;
    }
  }

  processResponse(
    messages: DeferredMessage<string, MessagePayload>[],
    response: MessagePayload
  ): boolean {
    const key = `${response.device.ieeeAddr}|${response.endpoint.ID}`;
    const deferredMessage = this.consumeMessage(key);
    if (deferredMessage) {
      this.log.debug(`Found message in queue for key ${key}, resolving`, response);
      deferredMessage.promise.resolve(response);
      return true;
    }
    this.log.warn(`Can't find message in queue for key ${key}`, messages);
    return false;
  }

  public resolveEntity(device: Device): ZigBeeEntity {
    const resolvedEntity = this.zigBee.resolveEntity(device);

    if (!resolvedEntity) {
      this.log.error(`Entity '${device}' is unknown`);
      return null;
    }
    return resolvedEntity;
  }

  public decodeMessage(
    message: MessagePayload,
    callback: StatePublisher,
    options: Options = {}
  ): void {
    const state = {} as DeviceState;
    const resolvedEntity: ZigBeeEntity = this.resolveEntity(message.device);
    if (resolvedEntity) {
      const meta: Meta = { device: message.device };
      const converters = resolvedEntity.definition.fromZigbee.filter(c => {
        const type = Array.isArray(c.type)
          ? c.type.includes(message.type)
          : c.type === message.type;
        return c.cluster === message.cluster && type;
      });
      converters.forEach(converter => {
        const converted = converter.convert(
          resolvedEntity.definition,
          message,
          (state: DeviceState) => {
            callback(message.device.ieeeAddr, state);
          },
          options,
          meta
        );
        if (converted) {
          Object.assign(state, converted);
        }
      });
    }
    callback(message.device.ieeeAddr, state);
  }

  private async readDeviceState(device: Device, state: DeviceState): Promise<DeviceState> {
    const resolvedEntity = this.resolveEntity(device);
    const converters = this.mapConverters(state, resolvedEntity);
    const deviceState: DeviceState = {};
    const usedConverters: Map<number, ToConverter[]> = new Map();
    const target = resolvedEntity.endpoint;
    const promises = [];
    for (const [key, converter] of converters.entries()) {
      if (usedConverters.get(target.ID)?.includes(converter)) {
        // Use a converter only once (e.g. light_onoff_brightness converters can convert state and brightness)
        continue;
      }
      const messageKey = `${device.ieeeAddr}|${target.ID}`;
      this.log.debug(
        `Reading '${key}' from '${resolvedEntity.name}, message in queue ${messageKey}'`
      );
      promises.push(this.enqueue(messageKey));

      converter.convertGet(target, key, { device, message: state }).catch(error => {
        this.log.error(`Reading '${key}' to '${resolvedEntity.name}' failed: '${error}'`);
        this.log.debug(error.stack);
        const deferredMessage = this.consumeMessage(messageKey);
        if (deferredMessage) {
          deferredMessage.promise.reject(error);
        }
      });
      if (!usedConverters.has(target.ID)) {
        usedConverters.set(target.ID, []);
      }
      usedConverters.get(target.ID).push(converter);
    }
    this.log.debug(`Sent ${promises.length} messages for device ${device.modelID}`);
    const responses = await Promise.all<MessagePayload>(promises);
    this.log.debug(`Got ${responses.length} messages for device ${device.modelID}`);
    responses.forEach(response => {
      this.decodeMessage(response, (ieeeAddr, state) => {
        this.log.debug(`Decoded message for ${response.device.modelID}`, state);
        Object.assign(deviceState, state);
      });
    });

    this.log.debug(`Device state (${device.modelID}): `, deviceState);
    return deviceState;
  }

  private async writeDeviceState(
    device: Device,
    state: DeviceState,
    options: Options = {}
  ): Promise<DeviceState> {
    const resolvedEntity = this.resolveEntity(device);
    const converters = this.mapConverters(state, resolvedEntity);
    const definition = resolvedEntity.definition;
    const target = resolvedEntity.endpoint;

    const meta: Meta = {
      options,
      message: state,
      logger: this.log,
      device,
      state: state,
      mapped: definition,
    };
    const deviceState: DeviceState = { ...state };
    const usedConverters: Map<number, ToConverter[]> = new Map();
    for (const [key, converter] of converters.entries()) {
      const value = state[key];
      if (usedConverters.get(target.ID)?.includes(converter)) {
        // Use a converter only once (e.g. light_onoff_brightness converters can convert state and brightness)
        continue;
      }
      try {
        this.log.debug(`Writing '${key}' to '${resolvedEntity.name}'`);
        const result = await converter.convertSet(target, key, value, meta);
        this.log.debug('Result from zigbee (SET)', result);
        // It's possible for devices to get out of sync when writing an attribute that's not reportable.
        // So here we re-read the value after a specified timeout, this timeout could for example be the
        // transition time of a color change or for forcing a state read for devices that don't
        // automatically report a new state when set.
        // When reporting is requested for a device (report: true in device-specific settings) we won't
        // ever issue a read here, as we assume the device will properly report changes.
        // Only do this when the retrieve_state option is enabled for this device.
        if (resolvedEntity.type === 'device' && result && result.readAfterWriteTime) {
          await sleep(result.readAfterWriteTime);
          await converter.convertGet(target, key, meta);
        }
        Object.assign(deviceState, result.state);
      } catch (error) {
        const message = `Writing '${key}' to '${
          resolvedEntity.name
        }' failed with converter ${converter.key.join(', ')}: '${error}'`;
        this.log.error(message);
        this.log.debug(error.stack);
      }
      if (!usedConverters.has(target.ID)) {
        usedConverters.set(target.ID, []);
      }
      usedConverters.get(target.ID).push(converter);
    }
    return deviceState;
  }

  private mapConverters(json: DeviceState, resolvedEntity: ZigBeeEntity) {
    const converters: Map<string, ToConverter> = new Map();
    this.getKeys(json).forEach(key => {
      const converter = resolvedEntity.definition.toZigbee.find(c => c.key.includes(key));

      if (!converter) {
        throw new Error(`No converter available for '${key}' (${json[key]})`);
      }
      converters.set(key, converter);
    });
    return converters;
  }

  private getKeys(json: DeviceState) {
    const keys: string[] = Object.keys(json);
    const sorter = json.state === 'OFF' ? 1 : -1;
    keys.sort(a =>
      ['state', 'brightness', 'brightness_percent'].includes(a) ? sorter : sorter * -1
    );
    return keys;
  }

  setOn(device: Device, on: boolean): Promise<DeviceState> {
    return this.writeDeviceState(device, { state: on ? 'ON' : 'OFF' });
  }

  getOnOffState(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { state: 'ON' });
  }

  getPowerState(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { power: 1 });
  }

  getCurrentState(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { current: 1 });
  }

  getVoltageState(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { voltage: 1 });
  }

  getColorXY(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { color: { x: 1, y: 1 } });
  }

  async getBrightnessPercent(device: Device): Promise<DeviceState> {
    const deviceState = await this.readDeviceState(device, { brightness: 1 });
    deviceState.brightness_percent = Math.round(Number(deviceState.brightness) / 2.55);
    return deviceState;
  }

  async setBrightnessPercent(device: Device, brightnessPercent: number) {
    const brightness = Math.round(Number(brightnessPercent) * 2.55);
    return this.writeDeviceState(device, {
      brightness,
    });
  }

  async getColorCapabilities(device: Device, force = false): Promise<ColorCapabilities> {
    const colorCapabilities = (await this.getClusterAttribute(
      device,
      'lightingColorCtrl',
      'colorCapabilities',
      force
    )) as number;

    return {
      colorTemperature: (colorCapabilities & (1 << 4)) > 0,
      colorXY: (colorCapabilities & (1 << 3)) > 0,
    };
  }

  async getClusterAttribute(
    device: Device,
    cluster: string,
    attribute: string,
    force = false
  ): Promise<string | number> {
    const resolvedEntity = this.zigBee.resolveEntity(device);
    const endpoint = resolvedEntity.endpoint;
    if (endpoint.getClusterAttributeValue(cluster, attribute) === undefined || force) {
      await endpoint.read(cluster, [attribute]);
    }
    return endpoint.getClusterAttributeValue(cluster, attribute);
  }

  getSaturation(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { color: { s: 1 } });
  }

  getHue(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { color: { hue: 1 } });
  }

  setHue(device: Device, hue: number): Promise<DeviceState> {
    return this.writeDeviceState(device, { color: { hue } });
  }

  setColorXY(device: Device, x: number, y: number): Promise<DeviceState> {
    return this.writeDeviceState(device, { color: { x, y } });
  }

  setColorRGB(device: Device, r: number, g: number, b: number): Promise<DeviceState> {
    return this.writeDeviceState(device, { color: { rgb: `${r},${g},${b}` } });
  }

  getTemperature(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { temperature: 1 });
  }

  getHumidity(device: Device): Promise<Partial<DeviceState>> {
    return this.readDeviceState(device, { humidity: 1 });
  }

  getCoodinator(): Device {
    return this.zigBee.coordinator();
  }

  async identify(device: Device) {
    return this.writeDeviceState(device, { alert: 'select' });
  }

  async setSaturation(device: Device, saturation: number) {
    return this.writeDeviceState(device, { color: { s: saturation } });
  }

  async getColorTemperature(device: Device) {
    return this.readDeviceState(device, {
      color_temp: 1,
    });
  }

  async setColorTemperature(device: Device, colorTemperature: number) {
    return this.writeDeviceState(device, {
      color_temp: colorTemperature,
    });
  }

  setLeftButtonOn(device: Device, on: boolean) {
    return this.writeDeviceState(device, { state_left: on ? 'ON' : 'OFF' });
  }

  setRightButtonOn(device: Device, on: boolean) {
    return this.writeDeviceState(device, { state_right: on ? 'ON' : 'OFF' });
  }

  getAllPairedDevices(): Device[] {
    return this.zigBee.list();
  }

  getDevice(ieeeAddr: string) {
    return this.zigBee.device(ieeeAddr);
  }

  permitJoin(value: boolean) {
    return this.zigBee.permitJoin(value);
  }

  getPermitJoin(): Promise<boolean> {
    return this.zigBee.getPermitJoin();
  }

  stop(): Promise<void> {
    return this.zigBee.stop();
  }

  touchlinkFactoryReset(): Promise<boolean> {
    return this.zigBee.touchlinkFactoryReset();
  }

  async unpairDevice(ieeeAddr: string): Promise<boolean> {
    try {
      this.log.info('Unpairing device:', ieeeAddr);
      await this.zigBee.remove(ieeeAddr);
      return true; // unpaired!
    } catch (error) {
      this.log.error(error);
      this.log.info('Unable to unpairing properly, trying to unregister device:', ieeeAddr);
      try {
        await this.zigBee.unregister(ieeeAddr);
        return true; // unregistered!
      } catch (e) {
        this.log.error(e);
      }
    }
    return false; // something went wrong
  }

  on(message: string, listener: (...args: any[]) => void) {
    this.zigBee.on(message, listener);
  }

  toggleLed(state: boolean): Promise<void> {
    return this.zigBee.toggleLed(state);
  }

  async ping(ieeeAddr: string) {
    return this.zigBee.ping(ieeeAddr);
  }

  async setCustomState(device: Device, state: DeviceState) {
    return this.writeDeviceState(device, state);
  }

  async getState(device: Device, state: DeviceState) {
    return this.readDeviceState(device, state);
  }

  async getCoordinatorVersion() {
    return this.zigBee.getCoordinatorVersion();
  }
}
