import { ZigBeeAccessory } from './zig-bee-accessory';
import { ZigbeeNTHomebridgePlatform } from '../platform';
import { PlatformAccessory, Service } from 'homebridge';
import { ZigBeeClient } from '../zigbee/zig-bee-client';
import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ContactSensorServiceBuilder } from '../builders/contact-sensor-service-builder';
import { MotionSensorServiceBuilder } from '../builders/motion-sensor-service-builder';
import { LighbulbServiceBuilder } from '../builders/lighbulb-service-builder';

type ServiceType = 'contact-sensor' | 'bulb' | 'motion-sensor';

interface ExposedService {
  type: ServiceType;
  meta: {
    colorTemp?: boolean;
    batteryLow?: boolean;
    colorXY?: boolean;
    brightness?: boolean;
  };
}

export interface AccessoryConfig {
  exposedServices: ExposedService[];
}

/**
 * Generic device accessory builder
 */
export class ConfigurableAccessory extends ZigBeeAccessory {
  private readonly accessoryConfig: AccessoryConfig;

  constructor(
    platform: ZigbeeNTHomebridgePlatform,
    accessory: PlatformAccessory,
    client: ZigBeeClient,
    device: Device,
    config: AccessoryConfig
  ) {
    super(platform, accessory, client, device);
    this.accessoryConfig = config;
  }

  getAvailableServices(): Service[] {
    const { platform, accessory, client, zigBeeDeviceDescriptor } = this;
    return this.accessoryConfig.exposedServices.map(expService => {
      switch (expService.type) {
        case 'contact-sensor':
          return new ContactSensorServiceBuilder(
            platform,
            accessory,
            client,
            zigBeeDeviceDescriptor
          )
            .withContact()
            .build();
        case 'bulb': {
          const builder = new LighbulbServiceBuilder(
            platform,
            accessory,
            client,
            zigBeeDeviceDescriptor
          ).withOnOff();
          if (expService.meta.brightness) {
            builder.withBrightness();
          }
          if (expService.meta.colorTemp) {
            builder.withColorTemperature();
          }
          if (expService.meta.colorXY) {
            builder.withColorXY();
          }
          return builder.build();
        }
        case 'motion-sensor':
          return new MotionSensorServiceBuilder(platform, accessory, client, zigBeeDeviceDescriptor)
            .withOccupancy()
            .build();
      }
    });
  }
}
