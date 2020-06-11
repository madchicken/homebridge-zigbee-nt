import { ZigBeeAccessoryCtor } from "./zig-bee-accessory";

const registry: Map<string, ZigBeeAccessoryCtor> = new Map();

function getKey(manufacturer: string, model: string) {
  return `${manufacturer}:${model}`;
}

export function registerAccessoryClass(manufacturer: string, models: string[], clazz: ZigBeeAccessoryCtor) {
  models.forEach(model => registry.set(getKey(manufacturer, model), clazz));
}

export function getAccessoryClass(manufacturer: string, model: string): ZigBeeAccessoryCtor {
  return registry.get(getKey(manufacturer, model));
}
