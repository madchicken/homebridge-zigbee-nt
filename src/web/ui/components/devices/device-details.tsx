import { Dialog, IconButton, Pane, Paragraph, SideSheet, Spinner, TrashIcon } from 'evergreen-ui';
import React, { ReactElement, useState } from 'react';
import { DeviceResponse, DevicesService } from '../../actions/devices';
import { useQuery, useQueryClient } from 'react-query';
import { Error } from '../error';
import { useHistory } from 'react-router-dom';
import * as H from 'history';
import { DeviceDetailsBody } from './device-details-body';
import { DEVICES_QUERY_KEY } from './device-table';
import { sizes } from '../constants';
import { DeviceModel } from '../../../common/types';

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
      onCancel={() => setState({ ...state, isDeleteConfirmationShown: false })}
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
          <Pane
            display="flex"
            padding={sizes.padding.small}
            background="tint2"
            borderRadius={3}
            width="100%"
            height={`${sizes.header.small}px`}
            flexDirection="row-reverse"
          >
            {queryResult.isLoading
              ? null
              : renderConfirmDialog(queryResult.data.device, state, setState, history)}
            <IconButton
              icon={TrashIcon}
              marginRight={sizes.margin.medium}
              intent="danger"
              onClick={() => setState({ ...state, isDeleteConfirmationShown: true })}
              disabled={queryResult.isLoading || queryResult.isError}
            />
          </Pane>
          <Pane
            zIndex={1}
            flexShrink={0}
            elevation={0}
            backgroundColor="white"
            height={`calc(100% - ${sizes.header.small}px)`}
          >
            {queryResult.isLoading ? (
              renderSpinner()
            ) : (
              <DeviceDetailsBody device={queryResult.data.device} />
            )}
          </Pane>
        </SideSheet>
      </React.Fragment>
    );
  }
  return null;
}
