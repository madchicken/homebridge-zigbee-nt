import React, { ReactElement, useState } from 'react';
import {
  Button,
  Dialog,
  Heading,
  Pane,
  Paragraph,
  SideSheet,
  Spinner,
  Table,
  Text,
} from 'evergreen-ui';
import { useQuery } from 'react-query';
import { DeviceModel, DeviceResponse, DevicesService } from '../actions/devices';
import { DeviceDetails } from './device-details';

function renderError(error: string): ReactElement {
  return (
    <Pane
      height={120}
      width={240}
      display="flex"
      alignItems="center"
      justifyContent="center"
      border="default"
    >
      <Heading>Error</Heading>
      <Text>{error}</Text>
      <Button>Ok</Button>
    </Pane>
  );
}

function renderTable(devices: DeviceModel[], setState) {
  return (
    <>
      {devices.map((device, index) => (
        <Table.Row
          key={index}
          isSelectable
          onSelect={() => setState({ isSidePanelShown: true, selectedDevice: device })}
        >
          <Table.TextCell>{device.modelID}</Table.TextCell>
          <Table.TextCell>{device.manufacturerName}</Table.TextCell>
          <Table.TextCell>{device.ieeeAddr}</Table.TextCell>
        </Table.Row>
      ))}
    </>
  );
}

function renderSpinner() {
  return (
    <Pane display="flex" alignItems="center" justifyContent="center" height="100%">
      <Spinner />
    </Pane>
  );
}

interface State {
  isSidePanelShown: boolean;
  selectedDevice: DeviceModel;
  isDialogShown: boolean;
}

async function reallyDeleteDevice(device: DeviceModel) {
  const response = await DevicesService.deleteDevice(device.ieeeAddr);
  return response.result === 'success';
}

export default function DeviceTable(): ReactElement {
  const queryResult = useQuery<DeviceResponse>('', DevicesService.fetchDevices);

  if (queryResult.isError) {
    return renderError(queryResult.error as string);
  }
  const [state, setState] = useState<State>({
    isSidePanelShown: false,
    selectedDevice: null,
    isDialogShown: false,
  });
  return (
    <Pane display="flex" flexDirection="column" justifyContent="stretch" width="100%">
      <Dialog
        isShown={state.isDialogShown}
        title="Are you sure?"
        onConfirm={async () => {
          if (await reallyDeleteDevice(state.selectedDevice)) {
            setState({ ...state, isDialogShown: false });
          }
        }}
        onCloseComplete={() => setState({ ...state, isDialogShown: false })}
        cancelLabel="Cancel"
        confirmLabel="Yes"
      >
        {state.selectedDevice && (
          <Paragraph size={300}>
            Are you sure you want to remove device {state.selectedDevice.modelID} (
            {state.selectedDevice.ieeeAddr})?
          </Paragraph>
        )}
      </Dialog>
      <SideSheet
        isShown={state.isSidePanelShown}
        onCloseComplete={() => setState({ ...state, isSidePanelShown: false })}
        containerProps={{
          display: 'flex',
          flex: '1',
          flexDirection: 'column',
        }}
      >
        <DeviceDetails device={state.selectedDevice} />
        <Pane display="flex" padding={16} background="tint2" borderRadius={3}>
          <Pane flex={1} alignItems="center" display="flex"></Pane>
          <Pane>
            {/* Below you can see the marginRight property on a Button. */}
            <Button marginRight={16} onClick={() => setState({ ...state, isDialogShown: true })}>
              Delete
            </Button>
            <Button
              appearance="primary"
              onClick={() => setState({ ...state, isSidePanelShown: false, selectedDevice: null })}
            >
              Ok
            </Button>
          </Pane>
        </Pane>
      </SideSheet>
      <Pane padding={16} borderBottom="muted">
        <Heading size={600}>Paired devices</Heading>
      </Pane>
      <Table>
        <Table.Head>
          <Table.SearchHeaderCell />
          <Table.TextHeaderCell>Manufacturer</Table.TextHeaderCell>
          <Table.TextHeaderCell>IEEE Address</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body height={240}>
          {queryResult.isLoading
            ? renderSpinner()
            : renderTable(queryResult.data.devices, setState)}
        </Table.Body>
      </Table>
    </Pane>
  );
}
