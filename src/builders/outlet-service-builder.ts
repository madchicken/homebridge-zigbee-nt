import { ZigBeeClient } from '../zig-bee-client';
import { Callback, CharacteristicEventTypes, PlatformAccessory, Service } from 'homebridge';
import { ZigbeeNTHomebridgePlatform } from '../platform';

export class OutletServiceBuilder {
  private readonly client: ZigBeeClient;
  private readonly accessory: PlatformAccessory;
  private readonly platform: ZigbeeNTHomebridgePlatform;
  private readonly service: Service;

  constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, client: ZigBeeClient) {
    this.platform = platform;
    this.accessory = accessory;
    this.client = client;
    this.service = this.accessory.getService(platform.Service.Outlet) ||
      this.accessory.addService(platform.Service.Outlet);
  }

  public withOnOff(): OutletServiceBuilder {
    const Characteristic = this.platform.Characteristic;

    this.service
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.SET, async (yes: boolean, callback: Callback) => {
        try {
          await this.client.sendMessage(this.accessory.context, 'set', { state: yes ? 'ON' : 'OFF' })
          callback();
        } catch (e) {
          callback(e);
        }
      });
    this.service
      .getCharacteristic(Characteristic.On)
      .on(CharacteristicEventTypes.GET, async (callback: Callback) => {
        const response = await this.client.sendMessage(this.accessory.context, 'get', { state: 'ON' });
        callback(null, response && response.getClusterAttributeValue('genOnOff', 'onOff'));
      });

    return this;
  }

  public build(): Service {
    return this.service;
  }
}
