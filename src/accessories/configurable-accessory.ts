import { ZigBeeAccessory } from './zig-bee-accessory';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ContactSensorServiceBuilder } from '../builders/contact-sensor-service-builder';
import { MotionSensorServiceBuilder } from '../builders/motion-sensor-service-builder';
import { LighbulbServiceBuilder } from '../builders/lighbulb-service-builder';
import { DeviceConfig, ExposedServiceConfig } from '../types';
import { BatteryServiceBuilder } from '../builders/battery-service-builder';
import { HumiditySensorServiceBuilder } from '../builders/humidity-sensor-service-builder';
import { TemperatureSensorServiceBuilder } from '../builders/temperature-sensor-service-builder';

function createLightBulbService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ExposedServiceConfig
) {
  const builder = new LighbulbServiceBuilder(
    platform,
    accessory,
    client,
    zigBeeDeviceDescriptor
  ).withOnOff();
  if (serviceConfig.meta.brightness) {
    builder.withBrightness();
  }
  if (serviceConfig.meta.colorTemp) {
    builder.withColorTemperature();
  }
  if (serviceConfig.meta.colorXY) {
    builder.withColorXY();
  }
  if (serviceConfig.meta.hue) {
    builder.withHue();
  }
  if (serviceConfig.meta.saturation) {
    builder.withSaturation();
  }
  return builder.build();
}

function createContactService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ExposedServiceConfig
) {
  const contactSensorServiceBuilder = new ContactSensorServiceBuilder(
    platform,
    accessory,
    client,
    zigBeeDeviceDescriptor
  ).withContact();
  if (serviceConfig.meta.batteryLow) {
    contactSensorServiceBuilder.withBatteryLow();
  }
  return contactSensorServiceBuilder.build();
}

function createMotionSensorService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ExposedServiceConfig
) {
  const motionSensorServiceBuilder = new MotionSensorServiceBuilder(
    platform,
    accessory,
    client,
    zigBeeDeviceDescriptor
  ).withOccupancy();
  if (serviceConfig.meta.batteryLow) {
    motionSensorServiceBuilder.withBatteryLow();
  }
  return motionSensorServiceBuilder.build();
}

function createHumiditySensorService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ExposedServiceConfig
) {
  const humiditySensorServiceBuilder = new HumiditySensorServiceBuilder(
    platform,
    accessory,
    client,
    zigBeeDeviceDescriptor
  ).withHumidity();
  if (serviceConfig.meta.batteryLow) {
    humiditySensorServiceBuilder.withBatteryLow();
  }
  return humiditySensorServiceBuilder.build();
}

function createTemperatureSensorService(
  platform: ZigbeeNTHomebridgePlatform,
  accessory: PlatformAccessory,
  client: ZigBeeClient,
  zigBeeDeviceDescriptor: Device,
  serviceConfig: ExposedServiceConfig
) {
  const temperatureSensorServiceBuilder = new TemperatureSensorServiceBuilder(
    platform,
    accessory,
    client,
    zigBeeDeviceDescriptor
  ).withTemperature();
  if (serviceConfig.meta.batteryLow) {
    temperatureSensorServiceBuilder.withBatteryLow();
  }
  return temperatureSensorServiceBuilder.build();
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

/**
 * Generic device accessory builder
 */
export class ConfigurableAccessory extends ZigBeeAccessory {
  private readonly accessoryConfig: DeviceConfig;

  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device,
    config: DeviceConfig
  ) {
    super(platform, accessory, client, device);
    this.accessoryConfig = config;
  }

  getAvailableServices(): Service[] {
    const { platform, accessory, client, zigBeeDeviceDescriptor } = this;
    return this.accessoryConfig.exposedServices.map(serviceConfig => {
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
        case 'battery':
          return createBatteryService(platform, accessory, client, zigBeeDeviceDescriptor);
      }
    });
  }
}
