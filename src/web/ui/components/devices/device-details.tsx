import { Button, Dialog, Pane, Paragraph, SideSheet, Spinner } from 'evergreen-ui';
import React, { ReactElement, useState } from 'react';
import { DeviceModel, DeviceResponse, DevicesService } from '../../actions/devices';
import { useQuery, useQueryClient } from 'react-query';
import { Error } from '../error';
import { useHistory } from 'react-router-dom';
import * as H from 'history';
import { DeviceDetailsBody } from './device-details-body';
import { DEVICES_QUERY_KEY } from './device-table';

interface State {
  isDeleteConfirmationShown: boolean;
  isDeletingDevice?: boolean;
  selectedTab: string;
}

function renderConfirmDialog(
  selectedDevice: DeviceModel,
  state: State,
  setState,
  history: H.History
) {
  const queryClient = useQueryClient();
  return (
    <Dialog
      isShown={state.isDeleteConfirmationShown}
      title="Unpair confirmation"
      onConfirm={async () => {
        setState({ ...state, isDeletingDevice: true });
        const response = await DevicesService.deleteDevice(selectedDevice.ieeeAddr);
        if (response.result === 'success') {
          setState({ ...state, isDialogShown: false, isDeletingDevice: false });
          await queryClient.invalidateQueries(DEVICES_QUERY_KEY);
          history.push('/devices');
        }
      }}
      isConfirmLoading={state.isDeletingDevice}
      onCancel={() => setState({ ...state, isDialogShown: false })}
      cancelLabel="Cancel"
      confirmLabel={state.isDeletingDevice ? 'Unpairing...' : 'Unpair'}
    >
      {selectedDevice && (
        <Paragraph size={300}>
          Are you sure you want to unpair device {selectedDevice.modelID} ({selectedDevice.ieeeAddr}
          )?
        </Paragraph>
      )}
    </Dialog>
  );
}

function renderSpinner() {
  return (
    <Pane display="flex" alignItems="center" justifyContent="center" height="100%">
      <Spinner />
    </Pane>
  );
}

interface Props {
  ieeeAddr: string;
}

export function DeviceDetails(props: Props): ReactElement {
  const history = useHistory();
  const queryResult = useQuery<DeviceResponse>(['device', props.ieeeAddr], () =>
    DevicesService.fetchDevice(props.ieeeAddr)
  );
  const [state, setState] = useState<State>({
    selectedTab: 'Info',
    isDeleteConfirmationShown: false,
  });

  if (queryResult) {
    if (queryResult.isError) {
      return <Error message={queryResult.error as string} />;
    }
    return (
      <React.Fragment>
        <SideSheet
          isShown={true}
          onCloseComplete={() => history.push('/devices')}
          containerProps={{
            display: 'flex',
            flex: '1',
            flexDirection: 'column',
          }}
        >
          <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white" minHeight={400}>
            {queryResult.isLoading ? (
              renderSpinner()
            ) : (
              <DeviceDetailsBody device={queryResult.data.device} />
            )}
          </Pane>
          <Pane display="flex" padding={16} background="tint2" borderRadius={3}>
            {queryResult.isLoading
              ? null
              : renderConfirmDialog(queryResult.data.device, state, setState, history)}
            <Pane>
              {/* Below you can see the marginRight property on a Button. */}
              <Button
                marginRight={16}
                onClick={() => setState({ ...state, isDeleteConfirmationShown: true })}
                disabled={queryResult.isLoading || queryResult.isError}
              >
                Delete
              </Button>
              <Button appearance="primary" onClick={() => setState({ ...state })}>
                Ok
              </Button>
            </Pane>
          </Pane>
        </SideSheet>
      </React.Fragment>
    );
  }
  return null;
}
