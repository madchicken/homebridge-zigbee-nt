import { ZigBeeAccessory } from '../zig-bee-accessory';
import { Service } from 'homebridge';

export class IkeaSignalRepeater extends ZigBeeAccessory {
  private wifiService: Service;

  getAvailableServices(): Service[] {
    const Service = this.platform.api.hap.Service;
    this.wifiService =
      this.accessory.getService(Service.WiFiTransport) ||
      this.accessory.addService(Service.WiFiTransport);

    return [this.wifiService];
  }
}
