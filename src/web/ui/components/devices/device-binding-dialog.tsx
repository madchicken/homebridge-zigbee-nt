import { Combobox, Dialog, Pane, TagInput } from 'evergreen-ui';
import { useDevices } from './device-table';
import React, { useState } from 'react';
import { Binding, DeviceModel } from '../../../common/types';
import { DevicesService } from '../../actions/devices';
import { Zcl } from 'zigbee-herdsman';

interface Props {
  device: DeviceModel;
  isShown: boolean;
  isNew: boolean;
  currentBindings: Binding[];
  bindingIndex: number;
  onClose: () => void;
}

interface State {
  isWorking: boolean;
  isNew: boolean;
  target: string;
  deviceClusters: string[];
}

export function DeviceBindingDialog(props: Props) {
  const { device } = props;

  const [state, setState] = useState<State>({
    isWorking: false,
    isNew: props.isNew,
    target: props.currentBindings.find(b => !!b.deviceIeeeAddress).deviceIeeeAddress,
    deviceClusters: [Zcl.Utils.getCluster(props.currentBindings[props.bindingIndex].cluster).name],
  });

  async function assignBindings() {
    setState({ ...state, isWorking: true });
    const endpoint = device.endpoints.find(
      e => e.ID === props.currentBindings.find(b => !!b.deviceIeeeAddress).endpointID
    );
    console.log('Binding endpoint ', endpoint);
    await DevicesService.bind(device.ieeeAddr, state.target, state.deviceClusters);
    setState({ ...state, isWorking: false });
  }

  return (
    <Dialog
      isShown={props.isShown}
      title="Modify Binding"
      onCloseComplete={() => props.onClose()}
      confirmLabel="Ok"
      onConfirm={() => assignBindings()}
      isConfirmLoading={state.isWorking}
    >
      <Pane>
        <Combobox
          isLoading={useDevices().isLoading}
          openOnFocus
          items={useDevices().data.devices.map(d => d.ieeeAddr)}
          onChange={selected => setState({ ...state, target: selected })}
          selectedItem={props.currentBindings[props.bindingIndex].deviceIeeeAddress}
        />
        <TagInput
          inputProps={{ placeholder: 'Add clusters...' }}
          values={state.deviceClusters}
          onChange={values => {
            setState({ ...state, deviceClusters: values });
          }}
        />
      </Pane>
    </Dialog>
  );
}
