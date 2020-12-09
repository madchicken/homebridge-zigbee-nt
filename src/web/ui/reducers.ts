import { combineReducers } from 'redux';
import { devicesReducers as devices, DeviceState } from './reducers/device';

export interface AppState {
  devices: DeviceState;
}

export const rootReducer = combineReducers<AppState>({
  devices,
});
