import { ZigBeeAccessory } from '../../zig-bee-accessory';
import { LighbulbServiceBuilder } from '../../builders/lighbulb-service-builder';
import { Service } from 'homebridge';
import { sleep } from '../../utils/sleep';

export class PhilipsHueWhite extends ZigBeeAccessory {
  private lightbulbService: Service;
  getAvailableServices() {
    this.lightbulbService = new LighbulbServiceBuilder(this.platform, this.accessory, this.client)
      .withOnOff()
      .withBrightness()
      .build();
    return [this.lightbulbService];
  }

  async handleAccessoryIdentify() {
    this.lightbulbService.setCharacteristic(this.platform.Characteristic.On, false);
    await sleep(500);
    this.lightbulbService.setCharacteristic(this.platform.Characteristic.On, true);
    await sleep(500);
    this.lightbulbService.setCharacteristic(this.platform.Characteristic.On, false);
  }
}
