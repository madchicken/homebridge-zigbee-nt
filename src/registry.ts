import { ZigBeeAccessoryCtor } from './zig-bee-accessory';
import { findByZigbeeModel } from 'zigbee-herdsman-converters';

const registry: Map<string, ZigBeeAccessoryCtor> = new Map();

function getKey(manufacturer: string, model: string) {
  return `${manufacturer}:${model}`;
}

export function registerAccessoryClass(
  manufacturer: string,
  models: string[],
  clazz: ZigBeeAccessoryCtor
) {
  models.forEach(model => registry.set(getKey(manufacturer, model), clazz));
}

export function getAccessoryClass(manufacturer: string, model: string): ZigBeeAccessoryCtor {
  let key = getKey(manufacturer, model);
  if (!registry.has(key)) {
    const zm = findByZigbeeModel(model);
    if (zm) {
      key = getKey(manufacturer, zm.model);
    }
  }
  return registry.get(key);
}
