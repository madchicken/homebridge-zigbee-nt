import assert from 'assert';
import retry from 'async-retry';
import { Logger, PlatformAccessory, Service } from 'homebridge';
import { isNull, isUndefined } from 'lodash';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { HAP } from '../index';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import {
  DEFAULT_POLL_INTERVAL,
  isDeviceRouter,
  MAX_POLL_INTERVAL,
  MIN_POLL_INTERVAL,
} from '../utils/device';
import { HSBType } from '../utils/hsb-type';
import { ButtonAction, DeviceState, ZigBeeDefinition, ZigBeeEntity } from '../zigbee/types';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { ConfigurableAccessory } from './configurable-accessory';
import { doWithButtonAction } from './utils';

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
) => ConfigurableAccessory;

const MAX_PING_ATTEMPTS = 1;

const MAX_NAME_LENGTH = 64;

function isValidValue(v: any) {
  return !isNull(v) && !isUndefined(v);
}

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
  public isOnline: boolean;

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
    this.isOnline = true;
    assert(this.entity !== null, 'ZigBee Entity resolution failed');
    const Characteristic = platform.Characteristic;
    this.accessory
      .getService(this.platform.Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, device.manufacturerName)
      .setCharacteristic(Characteristic.Model, device.modelID)
      .setCharacteristic(Characteristic.SerialNumber, device.ieeeAddr)
      .setCharacteristic(Characteristic.SoftwareRevision, `${device.softwareBuildID}`)
      .setCharacteristic(Characteristic.HardwareRevision, `${device.hardwareVersion}`)
      .setCharacteristic(Characteristic.Name, this.friendlyName);
    this.accessory.on('identify', () => this.handleAccessoryIdentify());
  }

  /**
   * Perform initialization of the accessory. By default is creates services exposed by the
   * accessory by invoking {@link ZigBeeAccessory.getAvailableServices}
   */
  public async initialize(): Promise<void> {
    this.mappedServices = this.getAvailableServices();
    try {
      this.onDeviceMount();
    } catch (e) {
      this.log.error(`Error mounting device ${this.friendlyName}: ${e.message}`);
    }
  }

  handleAccessoryIdentify(): void {}

  public get zigBeeDeviceDescriptor(): Device {
    return this.accessory.context as Device;
  }

  public get zigBeeDefinition(): ZigBeeDefinition {
    return this.entity.definition;
  }

  public get friendlyName(): string {
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

  public onDeviceMount(): void {
    this.log.info(`Mounting device ${this.friendlyName}...`);
    if (
      isDeviceRouter(this.zigBeeDeviceDescriptor) &&
      this.platform.config.disableRoutingPolling !== true
    ) {
      this.isOnline = false; // wait until we can ping the device
      this.log.info(`Device ${this.friendlyName} is a router, install ping`);
      this.interval = this.getPollingInterval();
      this.ping().then(() => this.log.debug(`Ping received from ${this.friendlyName}`));
    } else {
      this.configureDevice()
        .then(() => this.log.debug(`${this.friendlyName} successfully configured`))
        .catch(e => this.log.error(e.message));
    }
  }

  private getPollingInterval(): number {
    let interval = this.platform.config.routerPollingInterval * 1000 || DEFAULT_POLL_INTERVAL;
    if (this.interval < MIN_POLL_INTERVAL || this.interval > MAX_POLL_INTERVAL) {
      interval = DEFAULT_POLL_INTERVAL;
    }

    return interval;
  }

  public async ping(): Promise<void> {
    try {
      await this.zigBeeDeviceDescriptor.ping();
      await this.configureDevice();
      this.zigBeeDeviceDescriptor.save();
      this.missedPing = 0;
      this.isOnline = true;
      setTimeout(() => this.ping(), this.interval);
    } catch (e) {
      this.log.warn(`No response from ${this.entity.settings.friendlyName}. Is it online?`);
      this.missedPing++;
      if (this.missedPing > MAX_PING_ATTEMPTS) {
        this.log.error(
          `Device is not responding after ${MAX_PING_ATTEMPTS} ping, sending it offline...`
        );
        this.isOnline = false;
        this.zigBeeDeviceDescriptor.save();
      } else {
        setTimeout(() => this.ping(), this.interval);
      }
    }
  }

  public async configureDevice(): Promise<boolean> {
    if (this.shouldConfigure()) {
      this.isConfiguring = true;
      const coordinatorEndpoint = this.client.getCoordinator().getEndpoint(1);
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

  private get isConfigured() {
    return !!this.zigBeeDefinition.meta?.configured;
  }

  private set isConfigured(val: boolean) {
    if (val === true) {
      this.zigBeeDefinition.meta.configured = this.zigBeeDefinition.meta.configureKey;
    } else {
      delete this.zigBeeDefinition.meta?.configured;
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

  public internalUpdate(state: DeviceState): void {
    try {
      this.log.debug(`Updating state of device ${this.friendlyName} with `, state);
      this.state = Object.assign(this.state, { ...state });
      this.log.debug(`Updated state for device ${this.friendlyName} is now `, this.state);
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
  public update(state: DeviceState): void {
    const Service = this.platform.Service;
    const Characteristic = this.platform.Characteristic;
    const serviceMap = this.mappedServices.reduce((map, service) => {
      map.set(service.UUID, service);
      return map;
    }, new Map());
    [...serviceMap.values()].forEach(service => {
      this.log.debug(
        `Updating service ${service.UUID} for device ${this.friendlyName} with state`,
        state
      );
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
        case Service.Battery.UUID:
        case Service.BatteryService.UUID:
          if (isValidValue(state.battery)) {
            service.updateCharacteristic(Characteristic.BatteryLevel, state.battery || 0);
            service.updateCharacteristic(
              Characteristic.StatusLowBattery,
              state.battery && state.battery < 10
            );
          }
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
          if (isValidValue(state.state)) {
            service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
          }
          break;
        case Service.Lightbulb.UUID:
          if (isValidValue(state.state)) {
            service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
          }
          if (this.supports('brightness')) {
            if (isValidValue(state.brightness_percent)) {
              service.updateCharacteristic(
                this.platform.Characteristic.Brightness,
                state.brightness_percent
              );
            } else if (isValidValue(state.brightness)) {
              service.updateCharacteristic(
                this.platform.Characteristic.Brightness,
                Math.round(Number(state.brightness) / 2.55)
              );
            }
          }
          if (this.supports('color_temp') && isValidValue(state.color_temp)) {
            service.updateCharacteristic(
              this.platform.Characteristic.ColorTemperature,
              state.color_temp
            );
          }
          if (this.supports('color_hs') && isValidValue(state.color?.s)) {
            if (isValidValue(state.color?.s)) {
              service.updateCharacteristic(this.platform.Characteristic.Saturation, state.color.s);
            }
            if (isValidValue(state.color?.hue)) {
              service.updateCharacteristic(this.platform.Characteristic.Hue, state.color.hue);
            }
          } else if (this.supports('color_xy') && isValidValue(state.color?.x)) {
            const hsbType = HSBType.fromXY(state.color.x, state.color.y);
            state.color.hue = hsbType.hue;
            state.color.s = hsbType.saturation;
            service.updateCharacteristic(Characteristic.Hue, state.color.hue);
            service.updateCharacteristic(Characteristic.Saturation, state.color.s);
          }
          break;
        case Service.LightSensor.UUID:
          if (this.supports('illuminance_lux') && isValidValue(state.illuminance_lux)) {
            service.updateCharacteristic(
              Characteristic.CurrentAmbientLightLevel,
              state.illuminance_lux
            );
          }
          if (this.supports('illuminance') && isValidValue(state.illuminance)) {
            service.updateCharacteristic(
              Characteristic.CurrentAmbientLightLevel,
              state.illuminance
            );
          }
          break;
        case Service.MotionSensor.UUID:
          service.updateCharacteristic(
            this.platform.Characteristic.MotionDetected,
            state.occupancy === true
          );
          break;
        case Service.Outlet.UUID:
          if (isValidValue(state.state)) {
            service.updateCharacteristic(this.platform.Characteristic.On, state.state === 'ON');
          }
          if (this.supports('power') || this.supports('voltage') || this.supports('energy')) {
            service.updateCharacteristic(
              this.platform.Characteristic.InUse,
              state.power > 0 || state.voltage > 0 || state.current > 0
            );
            if (this.supports('power') && typeof state.power === 'number') {
              service.updateCharacteristic(HAP.CurrentPowerConsumption, state.power);
            }
            if (this.supports('voltage') && typeof state.voltage === 'number') {
              service.updateCharacteristic(HAP.CurrentVoltage, state.voltage);
            }
            if (this.supports('energy') && typeof state.current === 'number') {
              service.updateCharacteristic(HAP.CurrentConsumption, state.current);
            }
          }
          break;
        case Service.TemperatureSensor.UUID:
          if (isValidValue(state.temperature)) {
            service.updateCharacteristic(
              this.platform.Characteristic.CurrentTemperature,
              state.temperature
            );
          }
          break;
        case Service.HumiditySensor.UUID:
          if (isValidValue(state.humidity)) {
            service.updateCharacteristic(
              this.platform.Characteristic.CurrentRelativeHumidity,
              state.humidity
            );
          }
          break;
        case Service.StatelessProgrammableSwitch.UUID:
          this.handleButtonAction(state.action, service);
          break;
      }
    });
  }

  private handleButtonAction(action: ButtonAction, service: Service) {
    const ProgrammableSwitchEvent = this.platform.Characteristic.ProgrammableSwitchEvent;
    doWithButtonAction(action, (event: number) => {
      service.getCharacteristic(ProgrammableSwitchEvent).setValue(event);
    });
  }

  public supports(property: string): boolean {
    return (
      this.entity.definition.exposes?.find(capability => capability.name === property) !== null
    );
  }
}
