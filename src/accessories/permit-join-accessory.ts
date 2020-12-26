import { ZigbeeNTHomebridgePlatform } from '../platform';
import { CharacteristicEventTypes, PlatformAccessory, Service } from 'homebridge';

import { ZigBee } from '../zigbee/zigbee';

export class PermitJoinAccessory {
  private inProgress: boolean;
  private readonly platform: ZigbeeNTHomebridgePlatform;
  private readonly accessory: PlatformAccessory;
  private switchService: Service;
  private zigBee: ZigBee;

  constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, zigBee: ZigBee) {
    this.zigBee = zigBee;
    // Current progress status
    this.inProgress = false;
    // Save platform
    this.platform = platform;
    this.accessory = accessory;
    // Verify accessory
    const serialNumber = Math.random()
      .toString(36)
      .substr(2, 10);
    const Characteristic = platform.Characteristic;
    this.accessory
      .getService(platform.Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, 'None')
      .setCharacteristic(Characteristic.Model, 'None')
      .setCharacteristic(Characteristic.SerialNumber, serialNumber)
      .setCharacteristic(Characteristic.FirmwareRevision, '1.0.0')
      .setCharacteristic(platform.Characteristic.Name, 'ZigBee Permit Join');

    this.switchService =
      this.accessory.getService(platform.Service.Switch) ||
      this.accessory.addService(platform.Service.Switch);

    this.accessory.on('identify', () => this.handleAccessoryIdentify());
    const characteristic = this.switchService.getCharacteristic(this.platform.Characteristic.On);
    characteristic.on(CharacteristicEventTypes.GET, callback => this.handleGetSwitchOn(callback));
    characteristic.on(CharacteristicEventTypes.SET, (value, callback) => {
      this.handleSetSwitchOn(value, callback);
    });
    // Disable permit join on start
    this.setPermitJoin(false);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  handleAccessoryIdentify(): void {}

  async setPermitJoin(value: boolean) {
    await this.zigBee.permitJoin(value);
    this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(value);
    this.inProgress = value;
  }

  private handleGetSwitchOn(callback) {
    callback(null, this.inProgress);
  }

  private async handleSetSwitchOn(value, callback) {
    await this.setPermitJoin(value);
    callback();
  }
}
