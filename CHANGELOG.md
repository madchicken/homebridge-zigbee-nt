# Changelog

All notable changes to this project will be documented in this file. This project uses [Semantic Versioning](https://semver.org/).

## 2.0.0 (2021-1-19)

## [Version 2.0.0](https://github.com/madchicken/homebridge-zigbee-nt/compare/v1.1.2...v2.0.0)

#### Changes

- Complete refactoring: better code structure to improve reuse of existing code. Updating of devices is now centralized.
- NEW: ability to manually configure devices from plugin configuration. See [wiki](https://github.com/madchicken/homebridge-zigbee-nt/wiki/Add-new-devices-in-configuration) for more details. Supported devices types for manual config are
  * contact sensors
  * light bulbs, switches and dimmers
  * motion sensors
  * leak sensors (water, gas or smoke sensors)
  * vibration sensors
  * humidity sensors
  * temperature sensors
  * outlets
- NEW: permit join status can now be turned on at startup using `enablePermitJoin` boolean config value
- NEW: auto backup of zigbee database on startup (to reduce lost of paired devices when changing antenna configuration)
- NEW: support for adapter type in configuration through `adapter` value (supported values are zstack, deconz and zigate)
- FIX: pan id is now correctly passed down to antenna configuration [#79](https://github.com/madchicken/homebridge-zigbee-nt/pull/79) (thanks to [HalloTschuess](https://github.com/HalloTschuess))
- Improved UI with more device information
- NEW: support for Aquara Opple 4 buttons switch [#76](https://github.com/madchicken/homebridge-zigbee-nt/pull/76) (thanks to [tr1ng0](https://github.com/tr1ng0))
- NEW: support for Nanoleaf Ivy bulb [#80](https://github.com/madchicken/homebridge-zigbee-nt/pull/80) (thanks to [andi-farr](https://github.com/andi-farr))
- FIX: improved pairing process to avoid possible errors
- Upgraded all dependencies (herdsman and herdsman-converters in particular)
- NEW: support for [Xiaomi natural gas leak sensor](https://www.zigbee2mqtt.io/devices/JTQJ-BF-01LM_BW.html)

**NOTE: you might need to pair again all your devices because of a change in the herdsman lib to the pan ID of your antenna**
