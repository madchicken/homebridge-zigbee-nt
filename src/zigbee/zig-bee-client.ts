import { ZigBee } from './zigbee';
import { Logger } from 'homebridge';
import { createStore, Store } from '../utils/state-manager';
import { sleep } from '../utils/sleep';
import { MessagePayload } from 'zigbee-herdsman/dist/controller/events';
import { DeferredMessage, PromiseBasedQueue } from '../utils/promise-queue';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import { ColorCapabilities, DeviceState, Meta, Options, ToConverter, ZigBeeEntity } from './types';

export class ZigBeeClient extends PromiseBasedQueue<string, MessagePayload> {
  private readonly zigBee: ZigBee;
  private readonly log: Logger;
  private readonly store: Store<string, DeviceState>;

  constructor(zigBee: ZigBee, log: Logger) {
    super();
    this.zigBee = zigBee;
    this.log = log;
    this.store = createStore<string, DeviceState>();
    this.setTimeout(5000);
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

  public decodeMessage(message: MessagePayload, options: Options = {}): DeviceState {
    const payload = {} as DeviceState;
    const resolvedEntity = this.resolveEntity(message.device);
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
          () => {},
          options,
          meta
        );
        if (converted) {
          Object.assign(payload, converted);
        }
      });
    }
    return payload;
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
      const s = this.decodeMessage(response);
      this.log.debug(`Decoded message for ${response.device.modelID}`, s);
      Object.assign(deviceState, s);
    });

    this.log.info(`Device state (${device.modelID}): `, deviceState);
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
        const message = `Writing '${key}' to '${resolvedEntity.name}' failed: '${error}'`;
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

  getColorXY(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { color: { x: 0, y: 0 } });
  }

  async getBrightnessPercent(device: Device): Promise<DeviceState> {
    const deviceState = await this.readDeviceState(device, { brightness: 0 });
    deviceState.brightness_percent = Math.round(Number(deviceState.brightness) / 2.55);
    return deviceState;
  }

  async setBrightnessPercent(device: Device, brightness_percent: number) {
    const brightness = Math.round(Number(brightness_percent) * 2.55);
    return this.writeDeviceState(device, { brightness });
  }

  async getColorCapabilities(device: Device, force: boolean = false): Promise<ColorCapabilities> {
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
    force: boolean = false
  ): Promise<string | number> {
    const resolvedEntity = this.zigBee.resolveEntity(device);
    const endpoint = resolvedEntity.endpoint;
    if (endpoint.getClusterAttributeValue(cluster, attribute) === undefined || force) {
      await endpoint.read(cluster, [attribute]);
    }
    return endpoint.getClusterAttributeValue(cluster, attribute);
  }

  getSaturation(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { color: { s: 0 } });
  }

  getHue(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { color: { hue: 0 } });
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
    return this.readDeviceState(device, { temperature: 0 });
  }

  getHumidity(device: Device): Promise<Partial<DeviceState>> {
    return this.readDeviceState(device, { humidity: 0 });
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
      color_temp: 0,
    });
  }

  async setColorTemperature(device: Device, colorTemperature: number) {
    return this.writeDeviceState(device, { color_temp: colorTemperature });
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
}
