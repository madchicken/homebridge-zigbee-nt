import { Dialog, Paragraph } from 'evergreen-ui';
import React, { useState } from 'react';
import { DeviceModel, DevicesService } from '../../actions/devices';
import { useHistory } from 'react-router-dom';

interface Props {
  isShown: boolean;
  device: DeviceModel;
}

interface State {}

async function reallyDeleteDevice(ieeeAddr: string): Promise<boolean> {
  const response = await DevicesService.deleteDevice(ieeeAddr);
  return response.result === 'success';
}

export function DeviceDelete(props: Props) {
  const history = useHistory();
  const [state, setState] = useState<State>({});

  return (
    <Dialog
      isShown={props.isShown}
      title="Remove confirmation"
      onConfirm={async () => {
        if (await reallyDeleteDevice(props.device.ieeeAddr)) {
          setState({ ...state, isDialogShown: false });
          history.push('/devices');
        }
      }}
      onCancel={() => setState({ ...state, isDialogShown: false })}
      cancelLabel="Cancel"
      confirmLabel="Yes"
    >
      <Paragraph size={300}>
        Are you sure you want to remove (unpair) device {props.device.modelID} (
        {props.device.ieeeAddr}
      </Paragraph>
    </Dialog>
  );
}
