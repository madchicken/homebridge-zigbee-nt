import { Device } from 'zigbee-herdsman/dist/controller/model';
import { ServiceConfig } from '../types';
/**
 * Guess the accessory configuration by scanning the device definition and exposed capabilities.
 * Returns a configuration to pass to {@see ConfigurableAccessory} constructor
 *
 * @param device the ZigBee Device instance
 * @return ServiceConfig[] the guessed configuration
 */
export declare function guessAccessoryFromDevice(device: Device): ServiceConfig[];
//# sourceMappingURL=accessory-guesser.d.ts.map