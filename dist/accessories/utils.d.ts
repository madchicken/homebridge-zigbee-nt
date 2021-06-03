import { ButtonsMapping, ServiceMeta } from '../types';
import { ButtonAction, Feature } from '../zigbee/types';
export declare const SINGLE_PRESS = 0;
export declare const DOUBLE_PRESS = 1;
export declare const LONG_PRESS = 2;
export declare function doWithButtonAction(action: ButtonAction, fn: (event: number) => void): void;
export declare function getMetaFromFeatures(features: Feature[]): ServiceMeta;
export declare function featureToButtonsMapping(feature: Feature): ButtonsMapping;
export declare function buttonsMappingToHomeKitArray(mapping: ButtonsMapping): {
    [k: string]: number[];
};
//# sourceMappingURL=utils.d.ts.map