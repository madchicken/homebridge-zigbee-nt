import { useQueryClient } from 'react-query';
import { Dialog, Paragraph } from 'evergreen-ui';
import { DevicesService } from '../../actions/devices';
import { DEVICES_QUERY_KEY } from './device-table';
import React, { useState } from 'react';
import { DeviceModel } from '../../../common/types';
import { renderSpinner } from '../common';

interface Props {
  isDeleteConfirmationShown: boolean;
  selectedDevice: DeviceModel;
  onCancel: () => void;
  onSuccess: () => void;
}

interface State {
  isDeletingDevice: boolean;
  error: string;
}

export function DeleteDeviceModal(props: Props) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<State>({
    isDeletingDevice: false,
    error: null,
  });

  const { selectedDevice } = props;

  return (
    <Dialog
      isShown={props.isDeleteConfirmationShown}
      title="Unpair confirmation"
      onConfirm={async () => {
        setState({ ...state, isDeletingDevice: true });
        const response = await DevicesService.deleteDevice(selectedDevice.ieeeAddr);
        if (response.result === 'success') {
          await queryClient.invalidateQueries(DEVICES_QUERY_KEY);
          setState({ ...state, isDeletingDevice: false });
          props.onSuccess();
        } else {
          setState({ ...state, isDeletingDevice: false, error: response.error });
        }
      }}
      isConfirmLoading={state.isDeletingDevice}
      onCancel={props.onCancel}
      cancelLabel="Cancel"
      confirmLabel={state.isDeletingDevice ? 'Unpairing...' : 'Unpair'}
    >
      {selectedDevice && !!state.error && (
        <Paragraph size={300}>
          Are you sure you want to unpair device {selectedDevice.modelID} ({selectedDevice.ieeeAddr}
          )?
        </Paragraph>
      )}
      {state.error && (
        <Paragraph size={300}>
          An error occurred: {state.error}
        </Paragraph>
      )}
      {state.isDeletingDevice && renderSpinner()}
    </Dialog>
  );

}