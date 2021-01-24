import { DeviceModel } from '../../../common/types';
import { Dialog, Paragraph } from 'evergreen-ui';
import React, { useState } from 'react';
import { sleep } from '../../../../utils/sleep';

interface Props {
  device: DeviceModel;
  isShown: boolean;
  onClose: () => void;
}

interface State {
  isUpdating: boolean;
  percentage: number;
  error?: string;
}

function fakeUpdate(onProgress: (percentage: number, remaining: number) => void): Promise<void> {
  let percentage = 0;

  function getExecutor() {
    return async resolve => {
      while (percentage < 100) {
        percentage += 5;
        onProgress(percentage, 100 - percentage);
        await sleep(1000);
      }
      resolve();
    };
  }

  return new Promise<void>(getExecutor());
}

export function DeviceUpdate(props: Props) {
  const { device } = props;
  const [state, setState] = useState<State>({
    isUpdating: false,
    error: null,
    percentage: 0,
  });
  return (
    <Dialog
      isShown={props.isShown}
      title={`Upgrade firmware for ${device.manufacturerName} ${device.modelID}`}
      onCloseComplete={() => setState({ ...state, isUpdating: false })}
      confirmLabel="Start"
      isConfirmLoading={state.isUpdating}
      hasClose={!state.isUpdating}
      shouldCloseOnEscapePress={!state.isUpdating}
      hasCancel={!state.isUpdating}
      hasFooter={true}
      onConfirm={async () => {
        await fakeUpdate((percentage: number, _remaining: number) => {
          setState({ ...state, isUpdating: true, percentage });
        });
        setState({ ...state, isUpdating: false });
        props.onClose();
      }}
    >
      {state.isUpdating && (
        <Paragraph size={400}>
          <label htmlFor="update">Updating firmware...</label>
          <progress id="update" value={state.percentage} max="100">
            {state.percentage}%
          </progress>
        </Paragraph>
      )}
      {!state.isUpdating && (
        <Paragraph size={400}>
          Are you sure you want to upgrade firmware for device {device.manufacturerName}
          {device.modelID}?
        </Paragraph>
      )}
    </Dialog>
  );
}
