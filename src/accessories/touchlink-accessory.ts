import { ZigbeeNTHomebridgePlatform } from '../platform';
import { Logger, PlatformAccessory, Service } from 'homebridge';

import { ZigBee } from '../zigbee/zigbee';

export class TouchlinkAccessory {
  private inProgress: boolean;
  private readonly log: Logger;
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
      .setCharacteristic(Characteristic.Manufacturer, 'None')
      .setCharacteristic(Characteristic.Model, 'None')
      .setCharacteristic(Characteristic.SerialNumber, serialNumber)
      .setCharacteristic(Characteristic.FirmwareRevision, '1.0.0')
      .setCharacteristic(Characteristic.Name, 'ZigBee Touchlink');

    this.switchService =
      this.accessory.getService(platform.Service.Switch) ||
      this.accessory.addService(platform.Service.Switch);

    this.accessory.on('identify', () => this.handleAccessoryIdentify());
    const characteristic = this.switchService.getCharacteristic(this.platform.Characteristic.On);
    characteristic.on('get', callback => this.handleGetSwitchOn(callback));
    characteristic.on('set', (value, callback) => this.handleSetSwitchOn(value, callback));
  }

  handleAccessoryIdentify() {}

  handleGetSwitchOn(callback) {
    callback(null, this.inProgress);
  }

  handleSetSwitchOn(_value: boolean, callback) {
    this.log.info('Starting touchlink factory reset...');
    if (!this.inProgress) {
      this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(true);
      this.zigBee.touchlinkFactoryReset().then(result => {
        this.inProgress = false;
        this.switchService.getCharacteristic(this.platform.Characteristic.On).updateValue(false);
        if (result) {
          this.log.info('Successfully factory reset device through Touchlink');
        } else {
          this.log.warn('Failed to factory reset device through Touchlink');
        }
      });
    }
    callback();
  }
}
