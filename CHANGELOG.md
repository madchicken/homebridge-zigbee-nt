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

## 2.0.3 (2021-1-29)

## [Version 2.0.3](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.0.2...v2.0.3)

#### Changes

- Restore long press for IKEA ON/OFF button

## 2.0.5 (2021-2-04)

## [Version 2.0.5](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.0.3...v2.0.5)

#### Changes

- Let manufacturer name be an array to map multiple devices all at once ([#111](https://github.com/madchicken/homebridge-zigbee-nt/pull/111))
- Add Tuya Thermostat model TS0601 with manufacturer `_TZE200_2dpplnsn`

## 2.1.0 (2021-2-28)

## [Version 2.1.0](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.0.5...v2.1.0)

#### Changes

- New auto discovery for devices: with the new system of device mapping, many ZigBee accessories will just work. Supported type (ATM) are
  - lights
  - switches (only on/off switches, not multi buttons)
  - locks
    Coming soon devices
  - thermostats
  - complex switches
  - fan
- Update of devices is now done in background: all the GET request to the plugin will return immediately the last read value
- Ability to set friendly names for your devices: just add them through the homebridge plugin setting window.
- Many other small improvements and fixes

## 2.1.1 (2021-3-01)

## [Version 2.1.1](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.1.0...v2.1.1)

#### Changes

- Fix a problem were options passed during message decoding could be null
- Added first test for zigbee client
- Review eslint configuration and settings

## 2.1.2 (2021-3-03)

## [Version 2.1.2](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.1.1...v2.1.2)

#### Changes

- More robust checks during startup
- More logs when starting WEB UI (#131)

## 2.1.3 (2021-3-04)

## [Version 2.1.3](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.1.2...v2.1.3)

#### Changes

- Device \_TZE200_2dpplnsn TS0601 is not compatible with herdsman lib, removing from supported accessories
- Add support for \_TZE200_ywdxldoj.TS0601 thermostat (same as \_TZE200_ckud7u2l.TS0601)
- Add a try/catch during accessory initialisation to avoid plugin problems at startup
- Updated dependencies

## 2.2.0 (2021-3-21)

## [Version 2.2.0](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.1.3...v2.2.0)

#### Changes

- Multi switch auto discovery support
- Fix errors provided by default values
- Fix multi service support on a single device
- Updated dependencies

## 2.2.1 (2021-3-22)

## [Version 2.2.1](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.2.0...v2.2.1)

#### Changes

- Fix errors in thermostat values reporting [#140](https://github.com/madchicken/homebridge-zigbee-nt/issues/140)
- Fix error in WEB UI [#134](https://github.com/madchicken/homebridge-zigbee-nt/issues/134)
- Updated dependencies

## 2.2.2 (2021-3-25)

## [Version 2.2.2](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.2.1...v2.2.2)

#### Changes

- Fix state for devices [#141](https://github.com/madchicken/homebridge-zigbee-nt/issues/141)
- Add Fakegato (Elgato) support [#39](https://github.com/madchicken/homebridge-zigbee-nt/issues/39)
- Add support for Tuya smart dimmer [#119](https://github.com/madchicken/homebridge-zigbee-nt/issues/119)
- Updated dependencies

## 2.2.3 (2021-3-29)

## [Version 2.2.3](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.2.2...v2.2.3)

#### Changes

- Fix state for devices (again) [#141](https://github.com/madchicken/homebridge-zigbee-nt/issues/141)
- Fix issues with Moes/Tuya TS0601 thermostat issues [#140](https://github.com/madchicken/homebridge-zigbee-nt/issues/140)

## 2.2.4 (2021-3-30)

## [Version 2.2.4](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.2.3...v2.2.4)

#### Changes

- Fix issues with Moes/Tuya TS0601 thermostat issues [#140](https://github.com/madchicken/homebridge-zigbee-nt/issues/140)
- Updated dependencies

## 2.2.5 (2021-6-28)

## [Version 2.2.5](https://github.com/madchicken/homebridge-zigbee-nt/compare/v2.2.4...v2.2.5)

#### Changes

- Fix adapter initialization issue
- Fix double event coming from buttons
- Fix color issue with HUE bulbs (and all color bulbs)
- OTA update support in UI (beta)
