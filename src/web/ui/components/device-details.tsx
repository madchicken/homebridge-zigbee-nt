import {
  Button,
  Card,
  Dialog,
  Heading,
  Pane,
  Paragraph,
  SideSheet,
  Spinner,
  Tab,
  Tablist,
} from 'evergreen-ui';
import React, { ReactElement, useState } from 'react';
import { DeviceModel, DeviceResponse, DevicesService } from '../actions/devices';
import { useQuery } from 'react-query';
import { Error } from './error';
import { useHistory } from 'react-router-dom';
import * as H from 'history';

interface State {
  isDialogShown: boolean;
  selectedTab: string;
}

async function reallyDeleteDevice(device: DeviceModel): Promise<boolean> {
  const response = await DevicesService.deleteDevice(device.ieeeAddr);
  return response.result === 'success';
}

function renderConfirmDialog(
  selectedDevice: DeviceModel,
  state: State,
  setState,
  history: H.History
) {
  return (
    <Dialog
      isShown={state.isDialogShown}
      title="Are you sure?"
      onConfirm={async () => {
        if (await reallyDeleteDevice(selectedDevice)) {
          setState({ ...state, isDialogShown: false });
          history.push('/devices');
        }
      }}
      onCancel={() => setState({ ...state, isDialogShown: false })}
      cancelLabel="Cancel"
      confirmLabel="Yes"
    >
      {selectedDevice && (
        <Paragraph size={300}>
          Are you sure you want to remove device {selectedDevice.modelID} ({selectedDevice.ieeeAddr}
          )?
        </Paragraph>
      )}
    </Dialog>
  );
}

function renderInfo(device: DeviceModel) {
  return (
    <Card backgroundColor="white" elevation={0} display="flex" flexDirection="column" padding={2}>
      <Pane padding={4}>
        <Heading size={300}>Manufacturer: {device.manufacturerName}</Heading>
      </Pane>
      <Pane padding={4}>
        <Heading size={300}>Manufacturer ID: {device.manufacturerID}</Heading>
      </Pane>
      <Pane padding={4}>
        <Heading size={300}>IEEE Address: {device.ieeeAddr}</Heading>
      </Pane>
    </Card>
  );
}

function renderEndpoints(device: DeviceModel) {
  return (
    <Card
      backgroundColor="white"
      elevation={0}
      height={240}
      display="flex"
      alignItems="top"
      justifyContent="left"
    >
      <Heading>Endpoints</Heading>
      {device.endpoints.map(e => (
        <Paragraph key={e.ID}>{e.ID}</Paragraph>
      ))}
    </Card>
  );
}

function renderSelectedTab(selectedTab: string, device: DeviceModel) {
  switch (selectedTab) {
    case 'Info':
      return renderInfo(device);
    case 'Endpoints':
      return renderEndpoints(device);
  }
}

const TABS = ['Info', 'Endpoints'];

function renderDeviceDetails(
  device: DeviceModel,
  state: State,
  setState: (value: ((prevState: State) => State) | State) => void,
  history: H.History
) {
  return (
    <React.Fragment>
      <Pane padding={16} borderBottom="muted">
        <Heading size={600}>
          {device.manufacturerName} {device.modelID}
        </Heading>
        <Paragraph size={400} color="muted">
          {device.type}
        </Paragraph>
      </Pane>
      <Pane display="flex" padding={8} flexDirection="column">
        <Tablist>
          {TABS.map(tab => (
            <Tab
              key={tab}
              isSelected={state.selectedTab === tab}
              onSelect={() => setState({ ...state, selectedTab: tab })}
            >
              {tab}
            </Tab>
          ))}
        </Tablist>
        <Pane flex="1" overflowY="scroll" background="tint1" padding={4} flexDirection="column">
          {renderSelectedTab(state.selectedTab, device)}
        </Pane>
      </Pane>
      {renderConfirmDialog(device, state, setState, history)}
    </React.Fragment>
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
  const [state, setState] = useState({ selectedTab: 'Info', isDialogShown: false });

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
          <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
            {queryResult.isLoading
              ? renderSpinner()
              : renderDeviceDetails(queryResult.data.device, state, setState, history)}
          </Pane>
          <Pane display="flex" padding={16} background="tint2" borderRadius={3}>
            <Pane>
              {/* Below you can see the marginRight property on a Button. */}
              <Button marginRight={16} onClick={() => setState({ ...state, isDialogShown: true })}>
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
