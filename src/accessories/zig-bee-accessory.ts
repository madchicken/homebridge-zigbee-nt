import { Logger, PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { DeviceState, ZigBeeDefinition, ZigBeeEntity } from '../zigbee/types';
import {
  DEFAULT_POLL_INTERVAL,
  isDeviceRouter,
  MAX_POLL_INTERVAL,
  MIN_POLL_INTERVAL,
} from '../utils/device';
import retry from 'async-retry';
import assert from 'assert';

export interface ZigBeeAccessoryCtor {
  new (
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device
  ): ZigBeeAccessory;
}

export type ZigBeeAccessoryFactory = (
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  device: Device
) => ZigBeeAccessory;

const MAX_PING_ATTEMPTS = 3;

const MAX_NAME_LENGTH = 64;

export abstract class ZigBeeAccessory {
  public readonly ieeeAddr: string;
  protected platform: ZigbeeNTHomebridgePlatform;
  protected log: Logger;
  protected accessory: PlatformAccessory;
  protected readonly client: ZigBeeClient;
  protected state: DeviceState;
  protected readonly entity: ZigBeeEntity;
  private missedPing = 0;
  private isConfiguring = false;
  private interval: number;
  private mappedServices: Service[];

  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device
  ) {
    this.client = client;
    this.ieeeAddr = device.ieeeAddr;
    this.platform = platform;
    this.log = this.platform.log;
    this.state = {};
    this.accessory = accessory;
    this.accessory.context = device;
    this.entity = this.client.resolveEntity(device);
    assert(this.entity !== null, 'ZigBee Entity resolution failed');
    const Characteristic = platform.Characteristic;
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, device.manufacturerName)
      .setCharacteristic(Characteristic.Model, device.modelID)
      .setCharacteristic(Characteristic.SerialNumber, device.ieeeAddr)
      .setCharacteristic(Characteristic.SoftwareRevision, device.softwareBuildID)
      .setCharacteristic(Characteristic.HardwareRevision, device.hardwareVersion)
      .setCharacteristic(Characteristic.Name, this.friendlyName);
    this.accessory.on('identify', () => this.handleAccessoryIdentify());
  }

  /**
   * Perform initialization of the accessory. By default is creates services exposed by the
   * accessory by invoking {@link ZigBeeAccessory.getAvailableServices}
   */
  public async initialize(): Promise<void> {
    this.mappedServices = this.getAvailableServices();
    this.onDeviceMount()
      .then(() => {
        this.log.info(`Device ${this.friendlyName} mounted`);
      })
      .catch(e => this.log.error(`Error mounting device ${this.friendlyName}: ${e.message}`));
  }

  handleAccessoryIdentify() {}

  public get zigBeeDeviceDescriptor(): Device {
    return this.accessory.context as Device;
  }

  public get zigBeeDefinition(): ZigBeeDefinition {
    return this.entity.definition;
  }

  public get friendlyName() {
    const ieeeAddr = this.zigBeeDeviceDescriptor.ieeeAddr;
    return (
      this.entity?.settings?.friendlyName ||
      `${this.zigBeeDefinition.description.substr(
        0,
        MAX_NAME_LENGTH - 1 - ieeeAddr.length
      )}-${ieeeAddr}`
    );
  }

  public abstract getAvailableServices(): Service[];

  public async onDeviceMount() {
    this.log.info(`Mounting device ${this.friendlyName}...`);
    if (
      isDeviceRouter(this.zigBeeDeviceDescriptor) &&
      this.platform.config.disableRoutingPolling !== true
    ) {
      this.log.info(`Device ${this.friendlyName} is a router, install ping`);
      this.interval = this.getPollingInterval();
      await this.ping();
    } else {
      await this.configureDevice();
    }
  }

  private getPollingInterval(): number {
    let interval = this.platform.config.routerPollingInterval * 1000 || DEFAULT_POLL_INTERVAL;
    if (this.interval < MIN_POLL_INTERVAL || this.interval > MAX_POLL_INTERVAL) {
      interval = DEFAULT_POLL_INTERVAL;
    }

    return interval;
  }

  public async ping() {
    try {
      await this.zigBeeDeviceDescriptor.ping();
      await this.configureDevice();
      this.zigBeeDeviceDescriptor.updateLastSeen();
      this.zigBeeDeviceDescriptor.save();
      this.missedPing = 0;
      setTimeout(() => this.ping(), this.interval);
    } catch (e) {
      this.log.warn(`No response from ${this.entity.settings.friendlyName}. Is it online?`);
      this.missedPing++;
      if (this.missedPing > MAX_PING_ATTEMPTS) {
        this.log.error(
          `Device is not responding after ${MAX_PING_ATTEMPTS} ping, sending it offline...`
        );
        this.isConfiguring = false;
        this.isConfigured = false;
        this.zigBeeDeviceDescriptor.save();
      } else {
        setTimeout(() => this.ping(), this.interval);
      }
    }
  }

  public async configureDevice(): Promise<boolean> {
    if (this.shouldConfigure()) {
      this.isConfiguring = true;
      const coordinatorEndpoint = this.client.getCoodinator().getEndpoint(1);
      return await retry<boolean>(
        async (bail: (e: Error) => void, attempt: number) => {
          await this.zigBeeDefinition.configure(this.zigBeeDeviceDescriptor, coordinatorEndpoint);
          this.isConfigured = true;
          this.zigBeeDeviceDescriptor.save();
          this.log.info(
            `Device ${this.friendlyName} successfully configured on attempt ${attempt}!`
          );
          return true;
        },
        {
          retries: MAX_PING_ATTEMPTS,
          onRetry: (e: Error, attempt: number) => {
            if (attempt === MAX_PING_ATTEMPTS) {
              this.isConfiguring = false;
              this.isConfigured = false;
              this.zigBeeDeviceDescriptor.save();
            }
          },
        }
      );
    }
    return false;
  }

  private get isOnline() {
    return this.isConfigured || !this.shouldConfigure();
  }

  private get isConfigured() {
    return !!this.zigBeeDefinition.meta?.configured;
  }

  private set isConfigured(val: boolean) {
    if (val === true) {
      this.zigBeeDefinition.meta.configured = this.zigBeeDefinition.meta.configureKey;
    } else {
      delete this.zigBeeDefinition.meta.configured;
    }
  }

  private shouldConfigure() {
    return (
      !!this.zigBeeDefinition.configure && // it must have the configure function defined
      !this.isConfigured &&
      !this.zigBeeDefinition.interviewing &&
      !this.isConfiguring
    );
  }

  public internalUpdate(state: DeviceState) {
    try {
      this.log.debug(`Updating state of device ${this.friendlyName} with `, state);
      this.state = Object.assign(this.state, { ...state });
      this.log.debug(`Updated state for device ${this.friendlyName} is now `, this.state);
      this.zigBeeDeviceDescriptor.updateLastSeen();
      this.configureDevice().then(configured =>
        configured ? this.log.debug(`${this.friendlyName} configured after state update`) : null
      );
      this.update({ ...this.state });
      delete this.state.action;
    } catch (e) {
      this.log.error(e.message, e);
    }
  }

  /**
   * This function handles most of the characteristics update you need.
   * Override this function only if you need some specific update feature for your accessory
   * @param state DeviceState Current device state
   */
  public update(state: DeviceState) {
    const Service = this.platform.Service;
    const Characteristic = this.platform.Characteristic;
    this.mappedServices.forEach(service => {
      this.log.debug(`Updating service ${service.displayName} (UUID: ${service.UUID})`);
      if (this.supports('battery_low')) {
        service.updateCharacteristic(
          Characteristic.StatusLowBattery,
          state.battery_low
            ? Characteristic.StatusLowBattery.BATTERY_LEVEL_LOW
            : Characteristic.StatusLowBattery.BATTERY_LEVEL_NORMAL
        );
      }

      if (this.supports('tamper')) {
        service.updateCharacteristic(
          Characteristic.StatusTampered,
          state.tamper
            ? Characteristic.StatusTampered.TAMPERED
            : Characteristic.StatusTampered.NOT_TAMPERED
        );
      }

      switch (service.UUID) {
        case Service.BatteryService.UUID:
          service.updateCharacteristic(Characteristic.BatteryLevel, state.battery || 0);
          service.updateCharacteristic(
            Characteristic.StatusLowBattery,
            state.battery && state.battery < 10
          );
          break;
        case Service.ContactSensor.UUID:
          service.updateCharacteristic(
            Characteristic.ContactSensorState,
            state.contact
              ? Characteristic.ContactSensorState.CONTACT_DETECTED
              : Characteristic.ContactSensorState.CONTACT_NOT_DETECTED
          );
          break;
        case Service.LeakSensor.UUID:
          if (this.supports('water_leak')) {
            service
              .getCharacteristic(Characteristic.ContactSensorState)
              .setValue(
                state.water_leak === true
                  ? Characteristic.LeakDetected.LEAK_DETECTED
                  : Characteristic.LeakDetected.LEAK_NOT_DETECTED
              );
          }
          if (this.supports('gas')) {
            service
              .getCharacteristic(Characteristic.ContactSensorState)
              .setValue(
                state.gas === true
                  ? Characteristic.LeakDetected.LEAK_DETECTED
                  : Characteristic.LeakDetected.LEAK_NOT_DETECTED
              );
          }
          break;
        case Service.Switch.UUID:
          service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
          break;
        case Service.Lightbulb.UUID:
          service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
          if (this.supports('brightness')) {
            service.updateCharacteristic(
              this.platform.Characteristic.Brightness,
              state.brightness_percent
            );
          }
          if (this.supports('color_temp')) {
            service.updateCharacteristic(
              this.platform.Characteristic.ColorTemperature,
              state.color_temp
            );
          }
          break;
        case Service.LightSensor.UUID:
          service.updateCharacteristic(
            Characteristic.CurrentAmbientLightLevel,
            state.illuminance_lux
          );
          break;
        case Service.MotionSensor.UUID:
          service.updateCharacteristic(
            this.platform.Characteristic.MotionDetected,
            state.occupancy === true
          );
          break;
        case Service.Outlet.UUID:
          service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
          if (this.supports('power') || this.supports('voltage') || this.supports('energy')) {
            service.updateCharacteristic(
              this.platform.Characteristic.InUse,
              state.power > 0 || state.voltage > 0 || state.current > 0
            );
          }
          break;
        case Service.TemperatureSensor.UUID:
          service.updateCharacteristic(
            this.platform.Characteristic.CurrentTemperature,
            state.temperature
          );
          break;
        case Service.HumiditySensor.UUID:
          service.updateCharacteristic(
            this.platform.Characteristic.CurrentRelativeHumidity,
            state.humidity
          );
          break;
      }
    });
  }

  public supports(property: string): boolean {
    return (
      this.entity.definition.exposes?.find(capability => capability.name === property) !== null
    );
  }
}
