import { ButtonActionMapping, ButtonsMapping, ServiceMeta } from '../types';
import { ButtonAction, Feature } from '../zigbee/types';

export const SINGLE_PRESS = 0;
export const DOUBLE_PRESS = 1;
export const LONG_PRESS = 2;

export function doWithButtonAction(action: ButtonAction, fn: (event: number) => void): void {
  switch (action) {
    case 'on':
    case 'off':
    case 'single':
    case 'button_1_single':
    case 'button_2_single':
    case 'button_3_single':
    case 'button_4_single':
    case 'button_5_single':
    case 'button_6_single':
    case 'button_1_click':
    case 'button_2_click':
    case 'button_3_click':
    case 'button_4_click':
    case 'button_5_click':
    case 'button_6_click':
    case 'arrow_left_click':
    case 'arrow_right_click':
    case 'brightness_up_click':
    case 'brightness_down_click':
    case 'single_left':
    case 'single_right':
    case 'single_both':
      fn(SINGLE_PRESS);
      break;
    case 'brightness_move_up':
    case 'brightness_move_down':
    case 'brightness_up':
    case 'brightness_down':
    case 'button_1_hold':
    case 'button_2_hold':
    case 'button_3_hold':
    case 'button_4_hold':
    case 'button_5_hold':
    case 'button_6_hold':
    case 'toggle_hold':
    case 'arrow_left_hold':
    case 'arrow_right_hold':
    case 'hold':
    case 'brightness_up_hold':
    case 'brightness_down_hold':
    case 'brightness_down_release':
    case 'hold_left':
    case 'hold_right':
    case 'hold_both':
      fn(LONG_PRESS);
      break;
    case 'double':
    case 'button_1_double':
    case 'button_2_double':
    case 'button_3_double':
    case 'button_4_double':
    case 'button_5_double':
    case 'button_6_double':
    case 'double_left':
    case 'double_right':
    case 'double_both':
      fn(DOUBLE_PRESS);
      break;
    default:
      // skipped action
      break;
  }
}

export function getMetaFromFeatures(features: Feature[]): ServiceMeta {
  return features.reduce((meta, f) => {
    switch (f.name) {
      case 'color_xy':
        meta.colorXY = true;
        break;
      case 'color_hs':
        meta.colorHS = true;
        break;
      case 'color_temp':
        meta.colorTemp = true;
        break;
      case 'brightness':
        meta.brightness = true;
        break;
    }
    return meta;
  }, {} as ServiceMeta);
}

const validButtonNames = [
  '^(button_[0-9])_.*$',
  '^(arrow_(?:up|down|left|right))_.*$',
  '^(brightness_(?:up|down))_.*$',
  '^(toggle)(?:_hold)$',
  '^(on|off)$',
  '^(?:single|double|hold)_(left|right|both)$',
];

const SpecialMapping = {
  brightness_move_up: 'on',
  brightness_move_down: 'off',
};

export function featureToButtonsMapping(feature: Feature): ButtonsMapping {
  const actions = feature.values as ButtonAction[];
  let name = 'button';
  return actions.reduce((mapping, actionName) => {
    if (SpecialMapping[actionName]) {
      name = SpecialMapping[actionName];
    } else {
      const result = validButtonNames.reduce((prev, regex) => {
        const res = new RegExp(regex, 'g').exec(actionName);
        return res || prev;
      }, null as RegExpExecArray);
      if (result) {
        name = result[1];
      }
    }
    if (!mapping[name]) {
      mapping[name] = {} as ButtonActionMapping;
    }
    doWithButtonAction(actionName, (event: number) => {
      switch (event) {
        case SINGLE_PRESS:
          mapping[name][actionName] = 'SINGLE_PRESS';
          break;
        case DOUBLE_PRESS:
          mapping[name][actionName] = 'DOUBLE_PRESS';
          break;
        case LONG_PRESS:
          mapping[name][actionName] = 'LONG_PRESS';
          break;
      }
    });
    return mapping;
  }, {} as ButtonsMapping);
}

export function buttonsMappingToHomeKitArray(mapping: ButtonsMapping): { [k: string]: number[] } {
  return Object.entries(mapping).reduce((prev, entry) => {
    const [buttonName, config] = entry;
    //cycle though the button config and create an array of supported HomeKit actions (single, double or Long press)
    prev[buttonName] = Object.entries(config).map(actionMapping => {
      const action = actionMapping[1];
      switch (action) {
        case 'SINGLE_PRESS':
          return 0;
        case 'DOUBLE_PRESS':
          return 1;
        case 'LONG_PRESS':
          return 2;
      }
    });
    return prev;
  }, {});
}
