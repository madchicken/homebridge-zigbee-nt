import { ZigbeeNTHomebridgePlatform } from '../platform';
import { Logger, PlatformAccessory, Service } from 'homebridge';

import {ZigBee} from "../zigbee";

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
    this.accessory
      .getService(platform.Service.AccessoryInformation)
      .setCharacteristic(platform.Characteristic.Manufacturer, pkg.author.name)
      .setCharacteristic(platform.Characteristic.Model, pkg.name)
      .setCharacteristic(platform.Characteristic.SerialNumber, serialNumber)
      .setCharacteristic(platform.Characteristic.FirmwareRevision, pkg.version);

    this.switchService =
      this.accessory.getService(platform.Service.Switch) ||
      this.accessory.addService(platform.Service.Switch);

    this.accessory.on('identify', this.handleAccessoryIdentify);
    const characteristic = this.switchService.getCharacteristic(this.platform.Characteristic.On);
    characteristic.on('get', callback => this.handleGetSwitchOn(callback));
    characteristic.on('set', (value, callback) => this.handleSetSwitchOn(value, callback));
    // Disable permit join on start
    this.setPermitJoin(false);
  }

  handleAccessoryIdentify() {}

  async setPermitJoin(value, callback = () => {}) {
    await this.zigBee.permitJoin(value ? this.timeout : 0);
    this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(value);
    this.inProgress = value;
    callback();
  }

  handleGetSwitchOn(callback) {
    callback(null, this.inProgress);
  }

  handleSetSwitchOn(value, callback) {
    this.log.debug(value ? 'started' : 'stopped');
    this.setPermitJoin(value, () => {
      this.inProgress = value;
      callback();
    });
  }

  handlePermitJoin(joinTimeLeft) {
    if (joinTimeLeft === 0) {
      this.log.info('stopped');
    } else {
      this.log.info('time left:', joinTimeLeft);
    }
    const currentStatus = !!joinTimeLeft;
    if (this.inProgress !== currentStatus) {
      this.inProgress = currentStatus;
      this.switchService
        .getCharacteristic(this.platform.Characteristic.On)
        .updateValue(currentStatus);
    }
  }
}
