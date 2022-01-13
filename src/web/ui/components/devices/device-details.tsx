import { IconButton, Pane, SideSheet, Spinner, TrashIcon } from 'evergreen-ui';
import React, { ReactElement, useState } from 'react';
import { DeviceResponse, DevicesService } from '../../actions/devices';
import { useQuery } from 'react-query';
import { Error } from '../error';
import { useHistory } from 'react-router-dom';
import { DeviceDetailsBody } from './device-details-body';
import { sizes } from '../constants';
import { DeleteDeviceModal } from './delete-device-modal';

interface State {
  selectedTab: string;
  isDeleteConfirmationShown: boolean;
}

function renderSpinner() {
  return (
    <Pane display='flex' alignItems='center' justifyContent='center' height='100%'>
      <Spinner />
    </Pane>
  );
}

interface Props {
  ieeeAddr: string;
}

export function useDevice(ieeeAddr: string) {
  return useQuery<DeviceResponse>(['device', ieeeAddr], () => DevicesService.fetchDevice(ieeeAddr));
}

export function DeviceDetails(props: Props): ReactElement {
  const history = useHistory();
  const queryResult = useDevice(props.ieeeAddr);
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
            background="blueTint"
            borderRadius={3}
            width='100%'
            height={`${sizes.header.small}px`}
            flexDirection='row-reverse'
          >
            {!queryResult.isLoading && queryResult?.data && (
              <DeleteDeviceModal selectedDevice={queryResult.data.device}
                                 isDeleteConfirmationShown={state.isDeleteConfirmationShown}
                                 onCancel={() => {
                                   setState({ ...state, isDeleteConfirmationShown: false });
                                 }}
                                 onSuccess={() => {
                                   setState({ ...state, isDeleteConfirmationShown: false });
                                   history.push('/devices');
                                 }} />
            )}
            <IconButton
              icon={TrashIcon}
              marginRight={sizes.margin.medium}
              intent='danger'
              onClick={() => setState({ ...state, isDeleteConfirmationShown: true })}
              disabled={queryResult.isLoading || queryResult.isError}
            />
          </Pane>
          <Pane
            zIndex={1}
            flexShrink={0}
            elevation={0}
            backgroundColor='white'
            height={`calc(100% - ${sizes.header.small}px)`}
          >
            {queryResult.isLoading ? (
              renderSpinner()
            ) : (
              <DeviceDetailsBody
                device={queryResult.data.device}
                refresh={async () => {
                  await queryResult.refetch();
                }}
              />
            )}
          </Pane>
        </SideSheet>
      </React.Fragment>
    );
  }
  return null;
}
