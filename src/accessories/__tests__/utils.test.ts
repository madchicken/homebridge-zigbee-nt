import { featureToButtonsMapping } from '../utils';
import { ButtonAction, Feature } from '../../zigbee/types';

describe('Utility functions', () => {
  it('should create button mappings from declared feature (1 button, three actions)', () => {
    const buttonFeature: Feature = {
      type: 'enum',
      access: 1,
      name: 'action',
      values: ['on', 'brightness_move_up', 'brightness_stop'],
    };
    const mapping = featureToButtonsMapping(buttonFeature);
    expect(mapping['on']).toBeDefined();
    expect(mapping['on']['on']).toBeDefined();
    expect(mapping['on']['on']).toBe('SINGLE_PRESS');
    expect(mapping['on']['brightness_move_up']).toBe('LONG_PRESS');
    expect(mapping['on']['brightness_stop']).not.toBeDefined();
  });

  it('should create button mappings from declared feature (2 buttons, two actions each)', () => {
    const buttonFeature: Feature = {
      type: 'enum',
      access: 1,
      name: 'action',
      values: ['on', 'off', 'brightness_move_down', 'brightness_move_up', 'brightness_stop'],
    };
    const mapping = featureToButtonsMapping(buttonFeature);
    expect(mapping['on']).toBeDefined();
    expect(mapping['off']).toBeDefined();
    expect(mapping['on']['on']).toBe('SINGLE_PRESS');
    expect(mapping['off']['off']).toBe('SINGLE_PRESS');
    expect(mapping['on']['brightness_move_up']).toBe('LONG_PRESS');
    expect(mapping['off']['brightness_move_down']).toBe('LONG_PRESS');
  });

  it('should create button mappings from declared feature (4 buttons)', () => {
    const buttonFeature: Feature = {
      type: 'enum',
      access: 1,
      name: 'action',
      values: [
        'button_1_click',
        'button_1_hold',
        'button_1_release',
        'button_2_click',
        'button_2_hold',
        'button_2_release',
        'button_3_click',
        'button_3_hold',
        'button_3_release',
        'button_4_click',
        'button_4_hold',
        'button_4_release',
      ] as ButtonAction[],
    };
    const mapping = featureToButtonsMapping(buttonFeature);
    expect(mapping['button_1']).toBeDefined();
    expect(mapping['button_1']['button_1_click']).toBe('SINGLE_PRESS');
    expect(mapping['button_1']['button_1_hold']).toBe('LONG_PRESS');
    expect(mapping['button_2']).toBeDefined();
    expect(mapping['button_2']['button_2_click']).toBe('SINGLE_PRESS');
    expect(mapping['button_2']['button_2_hold']).toBe('LONG_PRESS');
    expect(mapping['button_3']).toBeDefined();
    expect(mapping['button_3']['button_3_click']).toBe('SINGLE_PRESS');
    expect(mapping['button_3']['button_3_hold']).toBe('LONG_PRESS');
    expect(mapping['button_4']).toBeDefined();
    expect(mapping['button_4']['button_4_click']).toBe('SINGLE_PRESS');
    expect(mapping['button_4']['button_4_hold']).toBe('LONG_PRESS');
  });

  it('should create button mappings from declared feature (5 buttons mixed)', () => {
    const buttonFeature: Feature = {
      type: 'enum',
      access: 1,
      name: 'action',
      values: [
        'brightness_down_release',
        'toggle_hold',
        'toggle',
        'arrow_left_click',
        'arrow_right_click',
        'arrow_left_hold',
        'arrow_right_hold',
        'arrow_left_release',
        'arrow_right_release',
        'brightness_up_click',
        'brightness_down_click',
        'brightness_up_hold',
        'brightness_up_release',
      ] as ButtonAction[],
    };
    const mapping = featureToButtonsMapping(buttonFeature);
    expect(mapping['brightness_up']).toBeDefined();
    expect(mapping['brightness_up']['brightness_up_click']).toBe('SINGLE_PRESS');
    expect(mapping['brightness_up']['brightness_up_hold']).toBe('LONG_PRESS');
    expect(mapping['brightness_down']).toBeDefined();
    expect(mapping['brightness_down']['brightness_down_click']).toBe('SINGLE_PRESS');
    expect(mapping['brightness_down']['brightness_down_release']).toBe('LONG_PRESS');
    expect(mapping['toggle']).toBeDefined();
    expect(mapping['toggle']['toggle_hold']).toBe('LONG_PRESS');
    expect(mapping['arrow_left']).toBeDefined();
    expect(mapping['arrow_left']['arrow_left_click']).toBe('SINGLE_PRESS');
    expect(mapping['arrow_left']['arrow_left_hold']).toBe('LONG_PRESS');
    expect(mapping['arrow_right']).toBeDefined();
    expect(mapping['arrow_right']['arrow_right_click']).toBe('SINGLE_PRESS');
    expect(mapping['arrow_right']['arrow_right_hold']).toBe('LONG_PRESS');
  });

  it('should create button mappings from declared feature (6 buttons)', () => {
    const buttonFeature: Feature = {
      type: 'enum',
      access: 1,
      name: 'action',
      values: [
        'button_1_hold',
        'button_1_release',
        'button_1_single',
        'button_1_double',
        'button_1_triple',
        'button_2_hold',
        'button_2_release',
        'button_2_single',
        'button_2_double',
        'button_2_triple',
        'button_3_hold',
        'button_3_release',
        'button_3_single',
        'button_3_double',
        'button_3_triple',
        'button_4_hold',
        'button_4_release',
        'button_4_single',
        'button_4_double',
        'button_4_triple',
        'button_5_hold',
        'button_5_release',
        'button_5_single',
        'button_5_double',
        'button_5_triple',
        'button_6_hold',
        'button_6_release',
        'button_6_single',
        'button_6_double',
        'button_6_triple',
      ] as ButtonAction[],
    };
    const mapping = featureToButtonsMapping(buttonFeature);
    expect(mapping['button_1']).toBeDefined();
    expect(mapping['button_1']['button_1_single']).toBe('SINGLE_PRESS');
    expect(mapping['button_1']['button_1_hold']).toBe('LONG_PRESS');
    expect(mapping['button_1']['button_1_double']).toBe('DOUBLE_PRESS');
    expect(mapping['button_2']).toBeDefined();
    expect(mapping['button_2']['button_2_single']).toBe('SINGLE_PRESS');
    expect(mapping['button_2']['button_2_hold']).toBe('LONG_PRESS');
    expect(mapping['button_2']['button_2_double']).toBe('DOUBLE_PRESS');
    expect(mapping['button_3']).toBeDefined();
    expect(mapping['button_3']['button_3_single']).toBe('SINGLE_PRESS');
    expect(mapping['button_3']['button_3_hold']).toBe('LONG_PRESS');
    expect(mapping['button_3']['button_3_double']).toBe('DOUBLE_PRESS');
    expect(mapping['button_4']).toBeDefined();
    expect(mapping['button_4']['button_4_single']).toBe('SINGLE_PRESS');
    expect(mapping['button_4']['button_4_hold']).toBe('LONG_PRESS');
    expect(mapping['button_4']['button_4_double']).toBe('DOUBLE_PRESS');
    expect(mapping['button_5']).toBeDefined();
    expect(mapping['button_5']['button_5_single']).toBe('SINGLE_PRESS');
    expect(mapping['button_5']['button_5_hold']).toBe('LONG_PRESS');
    expect(mapping['button_5']['button_5_double']).toBe('DOUBLE_PRESS');
    expect(mapping['button_6']).toBeDefined();
    expect(mapping['button_6']['button_6_single']).toBe('SINGLE_PRESS');
    expect(mapping['button_6']['button_6_hold']).toBe('LONG_PRESS');
    expect(mapping['button_6']['button_6_double']).toBe('DOUBLE_PRESS');
  });

  it('should create button mappings from declared feature (2 buttons + both)', () => {
    const buttonFeature: Feature = {
      type: 'enum',
      access: 1,
      name: 'action',
      values: [
        'single_left',
        'single_right',
        'single_both',
        'double_left',
        'double_right',
        'double_both',
        'hold_left',
        'hold_right',
        'hold_both',
      ] as ButtonAction[],
    };
    const mapping = featureToButtonsMapping(buttonFeature);
    expect(mapping['left']).toBeDefined();
    expect(mapping['left']['single_left']).toBe('SINGLE_PRESS');
    expect(mapping['left']['hold_left']).toBe('LONG_PRESS');
    expect(mapping['left']['double_left']).toBe('DOUBLE_PRESS');
    expect(mapping['right']).toBeDefined();
    expect(mapping['right']['single_right']).toBe('SINGLE_PRESS');
    expect(mapping['right']['hold_right']).toBe('LONG_PRESS');
    expect(mapping['right']['double_right']).toBe('DOUBLE_PRESS');
    expect(mapping['both']).toBeDefined();
    expect(mapping['both']['single_both']).toBe('SINGLE_PRESS');
    expect(mapping['both']['hold_both']).toBe('LONG_PRESS');
    expect(mapping['both']['double_both']).toBe('DOUBLE_PRESS');
  });
});
