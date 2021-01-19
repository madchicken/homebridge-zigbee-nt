import { ZigBeeAccessory } from './zig-bee-accessory';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ContactSensorServiceBuilder } from '../builders/contact-sensor-service-builder';
import { MotionSensorServiceBuilder } from '../builders/motion-sensor-service-builder';
import { LighbulbServiceBuilder } from '../builders/lighbulb-service-builder';
import { ServiceConfig } from '../types';
import { BatteryServiceBuilder } from '../builders/battery-service-builder';
import { HumiditySensorServiceBuilder } from '../builders/humidity-sensor-service-builder';
import { TemperatureSensorServiceBuilder } from '../builders/temperature-sensor-service-builder';
import { OutletServiceBuilder } from '../builders/outlet-service-builder';
import { LeakSensorServiceBuilder } from '../builders/leak-sensor-service-builder';

function createLightBulbService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ServiceConfig
) {
  const builder = new LighbulbServiceBuilder(
    platform,
    accessory,
    client,
    zigBeeDeviceDescriptor
  ).withOnOff();
  if (serviceConfig.meta?.brightness) {
    builder.withBrightness();
  }
  if (serviceConfig.meta?.colorTemp) {
    builder.withColorTemperature();
  }
  if (serviceConfig.meta?.colorXY) {
    builder.withColorXY();
  }
  if (serviceConfig.meta?.hue) {
    builder.withHue();
  }
  if (serviceConfig.meta?.saturation) {
    builder.withSaturation();
  }
  return builder.build();
}

function createContactService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ServiceConfig
) {
  const builder = new ContactSensorServiceBuilder(
    platform,
    accessory,
    client,
    zigBeeDeviceDescriptor
  ).withContact();
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
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ServiceConfig
) {
  const builder = new MotionSensorServiceBuilder(
    platform,
    accessory,
    client,
    zigBeeDeviceDescriptor
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
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ServiceConfig
) {
  const builder = new HumiditySensorServiceBuilder(
    platform,
    accessory,
    client,
    zigBeeDeviceDescriptor
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
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ServiceConfig
) {
  const builder = new TemperatureSensorServiceBuilder(
    platform,
    accessory,
    client,
    zigBeeDeviceDescriptor
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
  zigBeeDeviceDescriptor: Device
) {
  return new BatteryServiceBuilder(platform, accessory, client, zigBeeDeviceDescriptor)
    .withBatteryPercentage()
    .build();
}

function createOutletService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ServiceConfig
) {
  const builder = new OutletServiceBuilder(platform, accessory, client, zigBeeDeviceDescriptor);
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

function createLeakSensorService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ServiceConfig
) {
  const builder = new LeakSensorServiceBuilder(platform, accessory, client, zigBeeDeviceDescriptor);
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

/**
 * Generic device accessory builder
 */
export class ConfigurableAccessory extends ZigBeeAccessory {
  private readonly accessoryConfig: ServiceConfig[];

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
    const { platform, accessory, client, zigBeeDeviceDescriptor } = this;
    return this.accessoryConfig.map(serviceConfig => {
      switch (serviceConfig.type) {
        case 'contact-sensor':
          return createContactService(
            platform,
            accessory,
            client,
            zigBeeDeviceDescriptor,
            serviceConfig
          );
        case 'bulb': {
          return createLightBulbService(
            platform,
            accessory,
            client,
            zigBeeDeviceDescriptor,
            serviceConfig
          );
        }
        case 'motion-sensor':
          return createMotionSensorService(
            platform,
            accessory,
            client,
            zigBeeDeviceDescriptor,
            serviceConfig
          );
        case 'humidity-sensor':
          return createHumiditySensorService(
            platform,
            accessory,
            client,
            zigBeeDeviceDescriptor,
            serviceConfig
          );
        case 'temperature-sensor':
          return createTemperatureSensorService(
            platform,
            accessory,
            client,
            zigBeeDeviceDescriptor,
            serviceConfig
          );
        case 'leak-sensor':
          return createLeakSensorService(
            platform,
            accessory,
            client,
            zigBeeDeviceDescriptor,
            serviceConfig
          );
        case 'outlet':
          return createOutletService(
            platform,
            accessory,
            client,
            zigBeeDeviceDescriptor,
            serviceConfig
          );
        case 'battery':
          return createBatteryService(platform, accessory, client, zigBeeDeviceDescriptor);
      }
    });
  }
}
