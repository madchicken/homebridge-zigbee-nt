# Changelog

All notable changes to this project will be documented in this file. This project uses [Semantic Versioning](https://semver.org/).

## 2.0.0 (2021-1-19)

## [Version 2.0.0](https://github.com/madchicken/homebridge-zigbee-nt/compare/v1.1.2...v2.0.0)

#### Changes

- Complete refactoring: better code structure to improve reuse of existing code. Updating of devices is now centralized.
- NEW: ability to manually configure devices from plugin configuration. See [wiki](https://github.com/madchicken/homebridge-zigbee-nt/wiki/Add-new-devices-in-configuration) for more details. Supported devices types for manual config are
  - contact sensors
  - light bulbs, switches and dimmers
  - motion sensors
  - leak sensors (water, gas or smoke sensors)
  - vibration sensors
  - humidity sensors
  - temperature sensors
  - outlets
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

## 2.0.1 (2021-1-23)

## [Version 2.0.1](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.0.0...v2.0.1)

#### Changes

- Fix a bug with device state update [#74](https://github.com/madchicken/homebridge-zigbee-nt/issues/74)
- Do not read humidity/temperature (rely on device report) [#69](https://github.com/madchicken/homebridge-zigbee-nt/issues/69)
- Add devices to internal database
- Fix problem with accessories names: do not exceed 64 characters [#92](https://github.com/madchicken/homebridge-zigbee-nt/issues/92)

## 2.0.2 (2021-1-28)

## [Version 2.0.2](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.0.1...v2.0.2)

#### Changes

- Add 2 and 6 buttons support for Aquara Opple button [#94](https://github.com/madchicken/homebridge-zigbee-nt/pull/94) [#98](https://github.com/madchicken/homebridge-zigbee-nt/pull/98)
- Fix bug where switches were randomly turning on and off (driving people crazy by turning on bulbs in the middle of the night)
- Add support for BTicino Dimmer [#82](https://github.com/madchicken/homebridge-zigbee-nt/issues/82)
- Add support for LIDL motion sensor [#99](https://github.com/madchicken/homebridge-zigbee-nt/issues/99)
- Restore ping for router devices on mount process
- UI improvements
- Add support for TuYa plug [#85](https://github.com/madchicken/homebridge-zigbee-nt/issues/85)
- Add support for Xiaomi MiJia Honeywell smoke detector [#85](https://github.com/madchicken/homebridge-zigbee-nt/issues/85)
- Add support for Tuya Thermostatic Radiator Valve [#104](https://github.com/madchicken/homebridge-zigbee-nt/pull/104)

## 2.1.0 (2021-1-24)

## [Version 2.1.0](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.1.0...v2.0.1)

#### Changes

- Added OTA update in Web UI
- Added Bindings in Web UI
- Ability to ping devices for Web UI
