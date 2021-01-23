import React, { useState } from 'react';
import { Button, Pane, TextareaField } from 'evergreen-ui';
import { DevicesService } from '../../actions/devices';
import { DeviceState } from '../../../../zigbee/types';
import { sizes } from '../constants';
import ReactJson from 'react-json-view';
import { DeviceModel } from '../../../common/types';

interface Props {
  device: DeviceModel;
}

interface State {
  isWorking: boolean;
  deviceState: string;
  stateResponse?: DeviceState;
  error?: string;
}

export function DeviceStateManagement(props: Props) {
  const { device } = props;
  const [state, setState] = useState<State>({ isWorking: false, deviceState: '' });

  async function onClickSet() {
    setState({ ...state, isWorking: true, error: null });
    let response = {} as DeviceState;
    try {
      const newState = JSON.parse(state.deviceState) as DeviceState;
      const res = await DevicesService.setDeviceState(device.ieeeAddr, newState);
      if (res.result === 'error') {
        setState({ ...state, error: res.error });
      } else {
        response = res.state;
      }
    } catch (e) {
      setState({ ...state, error: e.message });
    } finally {
      setState({ ...state, isWorking: false, stateResponse: response });
    }
  }

  async function onClickGet() {
    setState({ ...state, isWorking: true, error: null });

    let response = {} as DeviceState;
    try {
      const newState = JSON.parse(state.deviceState) as DeviceState;
      const res = await DevicesService.getDeviceState(device.ieeeAddr, newState);
      console.log(res);
      if (res.result === 'error') {
        setState({ ...state, error: res.error });
      } else {
        response = res.state;
      }
    } catch (e) {
      console.log(e);
      setState({ ...state, error: e.toString() });
    } finally {
      setState({ ...state, isWorking: false, stateResponse: response });
    }
  }

  return (
    <Pane>
      <TextareaField
        label="Get or Set custom state"
        placeholder="Insert a valid json state here"
        value={state.deviceState}
        hint={state.error || 'test'}
        required
        onChange={e => setState({ ...state, deviceState: e.target.value })}
      />
      <Pane display="flex" flexDirection="row-reverse">
        <Button marginRight={sizes.margin.medium} onClick={onClickSet} disabled={state.isWorking}>
          Set
        </Button>
        <Button marginRight={sizes.margin.medium} onClick={onClickGet} disabled={state.isWorking}>
          Get
        </Button>
      </Pane>
      <Pane height="300px">
        <ReactJson src={state.stateResponse} onAdd={false} onDelete={false} onEdit={false} />
      </Pane>
    </Pane>
  );
}
