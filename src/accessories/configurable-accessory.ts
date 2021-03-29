import { PlatformAccessory, Service } from 'homebridge';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { AmbientLightServiceBuilder } from '../builders/ambient-light-service-builder';
import { BatteryServiceBuilder } from '../builders/battery-service-builder';
import { ContactSensorServiceBuilder } from '../builders/contact-sensor-service-builder';
import { HumiditySensorServiceBuilder } from '../builders/humidity-sensor-service-builder';
import { LeakSensorServiceBuilder } from '../builders/leak-sensor-service-builder';
import { LighbulbServiceBuilder } from '../builders/lighbulb-service-builder';
import { LockServiceBuilder } from '../builders/lock-service-builder';
import { MotionSensorServiceBuilder } from '../builders/motion-sensor-service-builder';
import { OutletServiceBuilder } from '../builders/outlet-service-builder';
import { ProgrammableSwitchServiceBuilder } from '../builders/programmable-switch-service-builder';
import { SwitchServiceBuilder } from '../builders/switch-service-builder';
import { TemperatureSensorServiceBuilder } from '../builders/temperature-sensor-service-builder';
import { ThermostatServiceBuilder } from '../builders/thermostat-service-builder';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { ServiceConfig } from '../types';
import { DeviceState } from '../zigbee/types';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { buttonsMappingToHomeKitArray } from './utils';
import { ZigBeeAccessory } from './zig-bee-accessory';

function createLightBulbService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  serviceConfig: ServiceConfig
) {
  const builder = new LighbulbServiceBuilder(platform, accessory, client, state).withOnOff();
  if (serviceConfig.meta?.colorXY) {
    platform.log.debug(
      `Light bulb ${platform.getDeviceFriendlyName(accessory.context.ieeeAddr)} supports ColorXY`
    );
    return builder.withColorXY().build();
  }
  if (serviceConfig.meta?.colorHS) {
    platform.log.debug(
      `Light bulb ${platform.getDeviceFriendlyName(accessory.context.ieeeAddr)} supports ColorHS`
    );
    return builder.withColorHS().build();
  }
  if (serviceConfig.meta?.brightness) {
    builder.withBrightness();
  }
  if (serviceConfig.meta?.colorTemp) {
    builder.withColorTemperature();
  }
  return builder.build();
}

function createContactService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  serviceConfig: ServiceConfig
) {
  const builder = new ContactSensorServiceBuilder(platform, accessory, client, state).withContact();
  if (serviceConfig.meta?.batteryLow) {
    builder.withBatteryLow();
  }
  if (serviceConfig.meta?.tamper) {
    builder.withTamper();
  }
  return builder.build();
}

function createMotionSensorService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  serviceConfig: ServiceConfig
) {
  const builder = new MotionSensorServiceBuilder(
    platform,
    accessory,
    client,
    state
  ).withOccupancy();
  if (serviceConfig.meta?.batteryLow) {
    builder.withBatteryLow();
  }
  if (serviceConfig.meta?.tamper) {
    builder.withTamper();
  }
  return builder.build();
}

function createHumiditySensorService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  serviceConfig: ServiceConfig
) {
  const builder = new HumiditySensorServiceBuilder(
    platform,
    accessory,
    client,
    state
  ).withHumidity();
  if (serviceConfig.meta?.batteryLow) {
    builder.withBatteryLow();
  }
  if (serviceConfig.meta?.tamper) {
    builder.withTamper();
  }
  return builder.build();
}

function createTemperatureSensorService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  serviceConfig: ServiceConfig
) {
  const builder = new TemperatureSensorServiceBuilder(
    platform,
    accessory,
    client,
    state
  ).withTemperature();
  if (serviceConfig.meta?.batteryLow) {
    builder.withBatteryLow();
  }
  if (serviceConfig.meta?.tamper) {
    builder.withTamper();
  }
  return builder.build();
}

function createBatteryService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState
) {
  return new BatteryServiceBuilder(platform, accessory, client, state)
    .withBatteryPercentage()
    .build();
}

function createOutletService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  serviceConfig: ServiceConfig
) {
  const builder = new OutletServiceBuilder(platform, accessory, client, state);
  builder.withOnOff();
  if (serviceConfig.meta?.power) {
    builder.withPower();
  }
  if (serviceConfig.meta?.current) {
    builder.withCurrent();
  }
  if (serviceConfig.meta?.voltage) {
    builder.withVoltage();
  }
  return builder.build();
}

function createSwitchService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  _serviceConfig: ServiceConfig
) {
  const builder = new SwitchServiceBuilder(platform, accessory, client, state);
  builder.withOnOff();
  return builder.build();
}

function createLeakSensorService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  serviceConfig: ServiceConfig
) {
  const builder = new LeakSensorServiceBuilder(platform, accessory, client, state);
  if (serviceConfig.meta?.tamper) {
    builder.withTamper();
  }
  if (serviceConfig.meta?.waterLeak) {
    builder.withWaterLeak();
  }
  if (serviceConfig.meta?.gasLeak) {
    builder.withGasLeak();
  }
  if (serviceConfig.meta?.smokeLeak) {
    builder.withSmokeLeak();
  }
  return builder.build();
}

function createVibrationSensorService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  serviceConfig: ServiceConfig
) {
  const builder = new ContactSensorServiceBuilder(platform, accessory, client, state);
  if (serviceConfig.meta?.tamper) {
    builder.withTamper();
  }
  if (serviceConfig.meta?.vibration) {
    builder.withVibration();
  }
  return builder.build();
}

function createAmbientLightService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  _serviceConfig: ServiceConfig
) {
  const builder = new AmbientLightServiceBuilder(platform, accessory, client, state);
  builder.withAmbientLightLevel();
  return builder.build();
}

function createLockService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  _serviceConfig: ServiceConfig
) {
  const builder = new LockServiceBuilder(platform, accessory, client, state);
  return builder.withLockState().build();
}

function createThermostatService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  serviceConfig: ServiceConfig
) {
  const builder = new ThermostatServiceBuilder(platform, accessory, client, state);
  if (serviceConfig.meta.localTemperature) {
    builder.withCurrentTemperature();
  }
  if (serviceConfig.meta.currentHeatingSetpoint) {
    builder.withTargetTemperature(
      serviceConfig.meta.currentHeatingSetpoint[0],
      serviceConfig.meta.currentHeatingSetpoint[1]
    );
  }

  return builder.build();
}

function createProgrammableSwitchService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  state: DeviceState,
  serviceConfig: ServiceConfig
): Service[] {
  const builder = new ProgrammableSwitchServiceBuilder(platform, accessory, client, state);

  const buttons = buttonsMappingToHomeKitArray(serviceConfig.meta.buttonsMapping);
  Object.entries(buttons).forEach((entry, index) => {
    const [button, events] = entry;
    builder.withStatelessSwitch(button.toUpperCase(), button, index + 1, events); // service index starts from 1
  });
  return builder.build();
}

/**
 * Generic device accessory builder
 */
export class ConfigurableAccessory extends ZigBeeAccessory {
  public readonly accessoryConfig: ServiceConfig[];

  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device,
    config: ServiceConfig[]
  ) {
    super(platform, accessory, client, device);
    this.accessoryConfig = config;
  }

  getAvailableServices(): Service[] {
    const { platform, accessory, client, state } = this;
    return this.accessoryConfig.reduce((services: Service[], serviceConfig) => {
      switch (serviceConfig.type) {
        case 'light-sensor':
          services.push(
            createAmbientLightService(platform, accessory, client, this.state, serviceConfig)
          );
          break;
        case 'contact-sensor':
          services.push(createContactService(platform, accessory, client, state, serviceConfig));
          break;
        case 'bulb':
        case 'light-bulb':
          services.push(createLightBulbService(platform, accessory, client, state, serviceConfig));
          break;
        case 'switch':
          services.push(createSwitchService(platform, accessory, client, state, serviceConfig));
          break;
        case 'motion-sensor':
          services.push(
            createMotionSensorService(platform, accessory, client, this.state, serviceConfig)
          );
          break;
        case 'humidity-sensor':
          services.push(
            createHumiditySensorService(platform, accessory, client, state, serviceConfig)
          );
          break;
        case 'temperature-sensor':
          services.push(
            createTemperatureSensorService(platform, accessory, client, state, serviceConfig)
          );
          break;
        case 'leak-sensor':
          services.push(createLeakSensorService(platform, accessory, client, state, serviceConfig));
          break;
        case 'vibration-sensor':
          services.push(
            createVibrationSensorService(platform, accessory, client, state, serviceConfig)
          );
          break;
        case 'outlet':
          services.push(createOutletService(platform, accessory, client, state, serviceConfig));
          break;
        case 'lock':
          services.push(createLockService(platform, accessory, client, state, serviceConfig));
          break;
        case 'thermostat':
          services.push(createThermostatService(platform, accessory, client, state, serviceConfig));
          break;
        case 'battery':
          services.push(createBatteryService(platform, accessory, client, state));
          break;
        case 'programmable-switch':
          services.push(
            ...createProgrammableSwitchService(platform, accessory, client, state, serviceConfig)
          );
          break;
      }
      return services;
    }, []);
  }
}
