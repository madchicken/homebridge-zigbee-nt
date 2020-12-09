import { AnyAction, combineReducers } from 'redux';
import { Device } from 'zigbee-herdsman/dist/controller/model';

export function fullActionName(modelName, action) {
  return `${modelName}/${action}`;
}

export interface DeviceState {
  fetchingOne: boolean;
  // destroyingOne: boolean;
  // destroyingMany: boolean;
  fetchingMany: boolean;

  fetchOneError: any;
  // destroyOneError: any;
  // destroyManyError: any;
  fetchManyError: any;

  //ids: string[];
  //list: Array<Device>;
  //map: Map<string, Device>;
  all: Device[];
}

export const ACTIONS = {
  FIND_ALL_RECORDS: {
    REQUEST: 'FIND_ALL_RECORDS_REQUEST',
    SUCCESS: 'FIND_ALL_RECORDS_SUCCESS',
    ERROR: 'FIND_ALL_RECORDS_ERROR',
  },
  FIND_RECORD: {
    REQUEST: 'FIND_RECORD_REQUEST',
    SUCCESS: 'FIND_RECORD_SUCCESS',
    ERROR: 'FIND_RECORD_ERROR',
  },
  DESTROY_RECORD: {
    REQUEST: 'DESTROY_RECORD_REQUEST',
    SUCCESS: 'DESTROY_RECORD_SUCCESS',
    ERROR: 'DESTROY_RECORD_ERROR',
  },
  DESTROY_RECORDS: {
    REQUEST: 'DESTROY_RECORDS_REQUEST',
    SUCCESS: 'DESTROY_RECORDS_SUCCESS',
    ERROR: 'DESTROY_RECORDS_ERROR',
  },
};

export const devicesReducers = combineReducers<DeviceState>({
  fetchingOne(state = false, action: AnyAction): boolean {
    switch (action.type) {
      case fullActionName('device', ACTIONS.FIND_RECORD.REQUEST):
        return true;
      case fullActionName('device', ACTIONS.FIND_RECORD.SUCCESS):
      case fullActionName('device', ACTIONS.FIND_RECORD.ERROR):
      case fullActionName('device', ACTIONS.FIND_ALL_RECORDS.ERROR):
        return false;
      default:
        return state;
    }
  },

  fetchOneError(state = null, action: AnyAction): Error {
    switch (action.type) {
      case fullActionName('device', ACTIONS.FIND_RECORD.ERROR):
        return action.payload as Error;
      case fullActionName('device', ACTIONS.FIND_RECORD.REQUEST):
      case fullActionName('device', ACTIONS.FIND_RECORD.SUCCESS):
        return null;
      default:
        return state;
    }
  },

  fetchingMany(state = false, action: AnyAction): boolean {
    switch (action.type) {
      case fullActionName('device', ACTIONS.FIND_ALL_RECORDS.REQUEST):
        return true;
      case fullActionName('device', ACTIONS.FIND_ALL_RECORDS.SUCCESS):
      case fullActionName('device', ACTIONS.FIND_ALL_RECORDS.ERROR):
        return false;
      default:
        return state;
    }
  },

  fetchManyError(state: any = null, action: AnyAction): Error {
    switch (action.type) {
      case fullActionName('device', ACTIONS.FIND_ALL_RECORDS.ERROR):
        return action.payload as Error;
      case fullActionName('device', ACTIONS.FIND_ALL_RECORDS.REQUEST):
      case fullActionName('device', ACTIONS.FIND_ALL_RECORDS.SUCCESS):
        return null;
      default:
        return state;
    }
  },

  all(state: Device[] = [], action: AnyAction): Device[] {
    const { payload } = action;

    switch (action.type) {
      case fullActionName('device', ACTIONS.FIND_RECORD.SUCCESS): {
        const record = payload as Device;
        if (record) {
          const old = state.find(r => r.ieeeAddr === record.ieeeAddr);
          if (!old) {
            return [...state, record];
          }
          state[state.indexOf(old)] = record;
          return [...state];
        }
        return state;
      }
      case fullActionName('device', ACTIONS.FIND_ALL_RECORDS.SUCCESS): {
        const records = payload as Device[];
        if (records) {
          return [
            ...[...state, ...records]
              .reduce((map, record: Device) => {
                map.set(record.ieeeAddr, record);
                return map;
              }, new Map())
              .values(),
          ];
        }
        return state;
      }
      case fullActionName('device', ACTIONS.DESTROY_RECORD.SUCCESS): {
        const record = payload as Device;
        if (record) {
          // filter out the record from the state
          return state.filter(r => r.ieeeAddr !== record.ieeeAddr);
        }
        return [...state];
      }
      case fullActionName('device', ACTIONS.DESTROY_RECORDS.SUCCESS): {
        const records = payload as Device[];
        if (records) {
          // remove all records from the state
          const ids = records.map(r => r.ieeeAddr);
          return state.filter(r => !ids.includes(r.ieeeAddr));
        }
        return [...state];
      }
      default:
        return state;
    }
  },
});
