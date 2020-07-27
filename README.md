![Logo](zigbee-logo.png)

# homebridge-zigbee-nt

ZigBee Platform plugin for [HomeBridge](https://github.com/homebridge/homebridge)

[![madchicken](https://circleci.com/gh/madchicken/homebridge-zigbee-nt.svg?style=svg)](https://app.circleci.com/pipelines/github/madchicken/homebridge-zigbee-nt)

## Description

This Homebridge plugin exposes ZigBee devices connected to TI's [CC253X](http://www.ti.com/wireless-connectivity/simplelink-solutions/zigbee/products.html) wireless SoC to Apple's HomeKit.
It uses [zigbee-herdsman](https://github.com/Koenkk/zigbee-herdsman) and [zigbee-herdsman-converters](https://github.com/Koenkk/zigbee-herdsman-converters) under the hood, so technically all supported devices mapped in zigbee-herdsman-converters should be supported.
To enable a new device you must implement a new HomeKit Device class and regirster it.

This project has been heavily inspired by [homebridge-zigbee](https://github.com/itsmepetrov/homebridge-zigbee) plugin by Anton Petrov.

## Supported devices

[See wiki page](https://github.com/madchicken/homebridge-zigbee-nt/wiki/Supported-devices)

## Build from sources

To build and run the plugin from sources, you need to install [yarn](https://yarnpkg.com) first.

Clone the repo:

    git clone git@github.com:madchicken/homebridge-zigbee-nt.git

Once you get it, run yarn command:

    yarn && yarn build

You should end up with a new `dist/` folder containing the compiled version of the plugin.

## License

Licensed under [MIT](LICENSE)

## Contribute

Any PR is welcome to this project, so please, fork and open one if you can!

If otherwise, you simply enjoyed using this plugin, and you want to contribute in some way, you can always donate something!

[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](paypal.me/madchicken74)
