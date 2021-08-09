import retry from 'async-retry';
import { Logger } from 'homebridge';
import { MessagePayload } from 'zigbee-herdsman/dist/controller/events';
import Device from 'zigbee-herdsman/dist/controller/model/device';
import { CustomDeviceSetting } from '../types';
import { findSerialPort } from '../utils/find-serial-port';
import { sleep } from '../utils/sleep';
import {
  ColorCapabilities,
  DeviceState,
  Meta,
  Options,
  SystemMode,
  ToConverter,
  ZigBeeControllerConfig,
  ZigBeeDefinition,
  ZigBeeEntity,
} from './types';
import { ZigBeeController } from './zigBee-controller';

export interface ZigBeeClientConfig {
  channel: number;
  port?: string;
  database: string;
  panId: number;
  secondaryChannel?: string;
  adapter?: 'zstack' | 'deconz' | 'zigate';
}

type StatePublisher = (ieeeAddr: string, state: DeviceState) => void;

export class ZigBeeClient {
  private readonly zigBee: ZigBeeController;
  private readonly deviceSettingsMap: Map<string, CustomDeviceSetting>;
  private readonly log: Logger;

  constructor(log: Logger, customDeviceSettings: CustomDeviceSetting[] = []) {
    this.zigBee = new ZigBeeController(log);
    this.log = log;
    this.deviceSettingsMap = new Map<string, CustomDeviceSetting>(
      customDeviceSettings.map(s => [s.ieeeAddr, s])
    );
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

  public resolveEntity(device: Device): ZigBeeEntity {
    const resolvedEntity = this.zigBee.resolveEntity(device);

    if (!resolvedEntity) {
      this.log.error(`Entity '${device}' is unknown`);
      return null;
    }
    resolvedEntity.settings = this.getDeviceSetting(resolvedEntity.device);
    return resolvedEntity;
  }

  private getDeviceSetting(device: Device) {
    return this.deviceSettingsMap.get(device.ieeeAddr) || { friendlyName: device.ieeeAddr };
  }

  public decodeMessage(message: MessagePayload, callback: StatePublisher): void {
    const resolvedEntity = this.resolveEntity(message.device);
    const state = {} as DeviceState;
    if (resolvedEntity) {
      const meta: Meta = { device: message.device };
      const converters = resolvedEntity.definition.fromZigbee.filter(c => {
        const type = Array.isArray(c.type)
          ? c.type.includes(message.type)
          : c.type === message.type;
        return c.cluster === message.cluster && type;
      });
      converters.forEach(converter => {
        const options: CustomDeviceSetting = this.deviceSettingsMap.get(
          message.device.ieeeAddr
        ) || { ieeeAddr: message.device.ieeeAddr };
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

  private async readDeviceState(device: Device, message: DeviceState): Promise<DeviceState> {
    const resolvedEntity = this.resolveEntity(device);
    const converters = this.mapConverters(this.getKeys(message), resolvedEntity.definition);
    const deviceState: DeviceState = {};
    const usedConverters: Map<number, ToConverter[]> = new Map();
    const target = resolvedEntity.endpoint;
    for (const [key, converter] of converters.entries()) {
      if (usedConverters.get(target.ID)?.includes(converter)) {
        // Use a converter only once (e.g. light_onoff_brightness converters can convert state and brightness)
        continue;
      }

      this.log.debug(`Reading KEY '${key}' from '${resolvedEntity.settings.friendlyName}'`);

      try {
        Object.assign(deviceState, await converter.convertGet(target, key, { device, message }));
      } catch (error) {
        this.log.error(
          `Reading '${key}' for '${resolvedEntity.settings.friendlyName}' failed: '${error}'`
        );
        this.log.debug(error.stack);
      }

      if (!usedConverters.has(target.ID)) {
        usedConverters.set(target.ID, []);
      }
      usedConverters.get(target.ID).push(converter);
    }
    this.log.debug(`Device state (${resolvedEntity.settings.friendlyName}): `, deviceState);
    return deviceState;
  }

  private async writeDeviceState(
    device: Device,
    state: DeviceState,
    options: Options = {}
  ): Promise<DeviceState> {
    const resolvedEntity = this.resolveEntity(device);
    const converters = this.mapConverters(this.getKeys(state), resolvedEntity.definition);
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

  /**
   * Creates a map of key => converter to use when talking with the dongle
   * @param keys an array of keys we want to extract
   * @param definition the zigbee definition of the device
   * @private
   */
  private mapConverters(keys: string[], definition: ZigBeeDefinition): Map<string, ToConverter> {
    return keys.reduce((converters: Map<string, ToConverter>, key) => {
      const converter = definition.toZigbee.find(c => c.key.includes(key));

      if (!converter) {
        // Thjs should really never happen!
        throw new Error(`No converter available for '${key}'`);
      }

      converters.set(key, converter);
      return converters;
    }, new Map());
  }

  private getKeys(json: DeviceState) {
    const keys: string[] = Object.keys(json);
    const sorter = json.state === 'OFF' ? 1 : -1;
    keys.sort(a =>
      ['state', 'brightness', 'brightness_percent'].includes(a) ? sorter : sorter * -1
    );
    return keys;
  }

  interview(ieeeAddr: string): Promise<Device> {
    return this.zigBee.interview(ieeeAddr);
  }

  setOnState(device: Device, on: boolean): Promise<DeviceState> {
    return this.writeDeviceState(device, { state: on ? 'ON' : 'OFF' });
  }

  getOnOffState(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { state: '' });
  }

  setLockState(device: Device, on: boolean): Promise<DeviceState> {
    return this.writeDeviceState(device, { state: on ? 'LOCK' : 'UNLOCK' });
  }

  getLockState(device: Device): Promise<DeviceState> {
    return this.getOnOffState(device);
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

  getLocalTemperature(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { local_temperature: 0 });
  }

  setCurrentHeatingSetpoint(device: Device, temperature: number): Promise<DeviceState> {
    return this.writeDeviceState(device, { current_heating_setpoint: temperature });
  }

  setSystemMode(device: Device, state: SystemMode): Promise<DeviceState> {
    return this.writeDeviceState(device, { system_mode: state });
  }

  getSystemMode(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { system_mode: 'off' });
  }

  getTemperature(device: Device): Promise<DeviceState> {
    return this.readDeviceState(device, { temperature: 1 });
  }

  getHumidity(device: Device): Promise<Partial<DeviceState>> {
    return this.readDeviceState(device, { humidity: 1 });
  }

  getCoordinator(): Device {
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

  async isUpdateFirmwareAvailable(device: Device, request = null): Promise<boolean> {
    const zigBeeEntity = this.zigBee.resolveEntity(device);
    if (zigBeeEntity.definition.ota) {
      return zigBeeEntity.definition.ota.isUpdateAvailable(device, this.log, request);
    }
    return false;
  }

  async updateFirmware(
    device: Device,
    onProgress: (percentage: number, remaining: number) => void
  ) {
    const zigBeeEntity = this.zigBee.resolveEntity(device);
    if (zigBeeEntity.definition.ota) {
      return zigBeeEntity.definition.ota.updateToLatest(device, this.log, onProgress);
    }
  }

  hasOTA(device: Device): boolean {
    const zigBeeEntity = this.zigBee.resolveEntity(device);
    return !!zigBeeEntity?.definition.ota;
  }

  private async bindOrUnbind(
    operation: 'bind' | 'unbind',
    sourceId: string,
    targetId: string,
    clusters: string[]
  ) {
    const clusterCandidates = [
      'genScenes',
      'genOnOff',
      'genLevelCtrl',
      'lightingColorCtrl',
      'closuresWindowCovering',
    ];
    const defaultBindGroup = {
      type: 'group_number',
      ID: 901,
      settings: { friendlyName: 'Default Group' },
    } as ZigBeeEntity;
    const source = this.resolveEntity(this.zigBee.device(sourceId));
    const target =
      targetId === 'default_bind_group'
        ? defaultBindGroup
        : this.resolveEntity(this.zigBee.device(targetId));
    this.log.info(`${operation}ing ${sourceId} from ${targetId} (clusters ${clusters.join(', ')})`);
    const successfulClusters = [];
    const failedClusters = [];
    await Promise.all(
      clusterCandidates.map(async cluster => {
        const targetValid =
          target.type === 'group' ||
          target.type === 'group_number' ||
          target.device.type === 'Coordinator' ||
          target.endpoint.supportsInputCluster(cluster);
        if (clusters && clusters.includes(cluster)) {
          if (source.endpoint.supportsOutputCluster(cluster) && targetValid) {
            const sourceName = source.device.ieeeAddr;
            const targetName = target.device?.ieeeAddr;
            this.log.debug(
              `${operation}ing cluster '${cluster}' from '${source.settings.friendlyName ||
                sourceName}' to '${target.settings.friendlyName}'`
            );
            try {
              let bindTarget;
              if (target.type === 'group') bindTarget = target.group;
              else if (target.type === 'group_number') bindTarget = target.ID;
              else bindTarget = target.endpoint;

              if (operation === 'bind') {
                await source.endpoint.bind(cluster, bindTarget);
              } else {
                this.log.info(`Unbinding ${cluster} from ${bindTarget}`);
                await source.endpoint.unbind(cluster, bindTarget);
                this.log.info(`Done unbinding ${cluster} from ${bindTarget}`);
              }

              successfulClusters.push(cluster);
              this.log.info(
                `Successfully ${
                  operation === 'bind' ? 'bound' : 'unbound'
                } cluster '${cluster}' from ` + `'${sourceName}' to '${targetName}'`
              );
            } catch (error) {
              failedClusters.push(cluster);
              this.log.error(
                `Failed to ${operation} cluster '${cluster}' from '${sourceName}' to ` +
                  `'${targetName}' (${error})`
              );
            }
          }
        } else {
          this.log.warn(`Clusters don't include ${cluster} (${clusters.join(', ')})`);
        }
      })
    );
    return {
      successfulClusters,
      failedClusters,
    };
  }

  async bind(sourceId: string, targetId: string, clusters: string[]) {
    return this.bindOrUnbind('bind', sourceId, targetId, clusters);
  }

  async unbind(sourceId: string, targetId: string, clusters: string[]) {
    return this.bindOrUnbind('unbind', sourceId, targetId, clusters);
  }
}
