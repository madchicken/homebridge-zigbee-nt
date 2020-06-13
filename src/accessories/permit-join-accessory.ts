import { ZigbeeNTHomebridgePlatform } from '../platform';
import { CharacteristicEventTypes, Logger, PlatformAccessory, Service } from 'homebridge';

import { ZigBee } from '../zigbee';

const pkg = require('../../package.json');

export class PermitJoinAccessory {
  private inProgress: boolean;
  private readonly timeout: number;
  private readonly log: Logger;
  private readonly platform: ZigbeeNTHomebridgePlatform;
  private readonly accessory: PlatformAccessory;
  private switchService: Service;
  private zigBee: ZigBee;

  constructor(platform: ZigbeeNTHomebridgePlatform, accessory: PlatformAccessory, zigBee: ZigBee) {
    this.zigBee = zigBee;
    // Current progress status
    this.inProgress = false;
    // Permit join timeout
    this.timeout = platform.config.permitJoinTimeout || 120;
    // Save platform
    this.platform = platform;
    // Save logger
    this.log = platform.log;
    this.accessory = accessory;
    // Verify accessory
    const serialNumber = Math.random()
      .toString(36)
      .substr(2, 10);
    const Characteristic = platform.Characteristic;
    this.accessory
      .getService(platform.Service.AccessoryInformation)
      .setCharacteristic(Characteristic.Manufacturer, pkg.author.name)
      .setCharacteristic(Characteristic.Model, pkg.name)
      .setCharacteristic(Characteristic.SerialNumber, serialNumber)
      .setCharacteristic(Characteristic.FirmwareRevision, pkg.version)
      .setCharacteristic(platform.Characteristic.Name, 'ZigBee Permit Join');

    this.switchService =
      this.accessory.getService(platform.Service.Switch) ||
      this.accessory.addService(platform.Service.Switch);

    this.accessory.on('identify', this.handleAccessoryIdentify);
    const characteristic = this.switchService.getCharacteristic(this.platform.Characteristic.On);
    characteristic.on(CharacteristicEventTypes.GET, callback => this.handleGetSwitchOn(callback));
    characteristic.on(CharacteristicEventTypes.SET, (value, callback) =>
      this.handleSetSwitchOn(value, callback)
    );
    // Disable permit join on start
    this.setPermitJoin(false);
  }

  handleAccessoryIdentify() {}

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
