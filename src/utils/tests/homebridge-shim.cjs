'use strict';

// CJS shim for homebridge 2.x (ESM-only) — used only in Jest tests.
// Sources real HAP types from @homebridge/hap-nodejs (CJS) and provides
// a minimal HomebridgeAPI class matching what our tests need.

const hap = require('@homebridge/hap-nodejs');
const { EventEmitter } = require('events');

const APIEvent = {
  DID_FINISH_LAUNCHING: 'didFinishLaunching',
  SHUTDOWN: 'shutdown',
};

class PlatformAccessory extends EventEmitter {
  constructor(displayName, uuid) {
    super();
    this.displayName = displayName;
    this.UUID = uuid;
    this.services = [];
    this.context = {};
    this._associatedHAPAccessory = new hap.Accessory(displayName, uuid);
  }

  getService(serviceOrName) {
    return this._associatedHAPAccessory.getService(serviceOrName);
  }

  addService(serviceOrConstructor, ...args) {
    return this._associatedHAPAccessory.addService(serviceOrConstructor, ...args);
  }

  removeService(service) {
    return this._associatedHAPAccessory.removeService(service);
  }

  getServiceById(uuid, subType) {
    return this._associatedHAPAccessory.getServiceById(uuid, subType);
  }
}

class HomebridgeAPI extends EventEmitter {
  constructor() {
    super();
    this.hap = hap;
    this.platformAccessory = PlatformAccessory;
    this.serverVersion = '2.0.0';
    this.version = 2;
    this.user = {
      storagePath: () => '/tmp/homebridge-test',
      configPath: () => '/tmp/homebridge-test/config.json',
      cachedAccessoryPath: () => '/tmp/homebridge-test/accessories',
      persistPath: () => '/tmp/homebridge-test/persist',
    };
  }

  registerPlatformAccessories(_pluginName, _platformName, _accessories) {}
  unregisterPlatformAccessories(_pluginName, _platformName, _accessories) {}
  updatePlatformAccessories(_accessories) {}
  publishCameraAccessories(_pluginName, _accessories) {}
  registerAccessory(_pluginName, _accessoryName, _constructor) {}
  registerPlatform(_pluginName, _platformName, _constructor, _dynamic) {}
}

module.exports = {
  ...hap,
  HomebridgeAPI,
  PlatformAccessory,
  APIEvent,
};
