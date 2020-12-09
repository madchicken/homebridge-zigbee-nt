import React, { ReactElement } from 'react';
import { Button, Heading, Pane, Table, Text } from 'evergreen-ui';
import { useQuery } from 'react-query';
import { DeviceResponse, fetchDevicesFromAPI } from '../actions/devices';

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

function renderNoDevices(): ReactElement {
  return (
    <Pane
      height={120}
      width={240}
      display="flex"
      alignItems="center"
      justifyContent="center"
      border="default"
    >
      <Heading>Warning</Heading>
      <Text>No device mapped</Text>
      <Button>Ok</Button>
    </Pane>
  );
}

export default function DeviceTable(): ReactElement {
  const queryResult = useQuery<DeviceResponse>('', fetchDevicesFromAPI);

  if (queryResult.isError) {
    return renderError(queryResult.error as string);
  }
  const devices = queryResult.data?.devices;
  if (!devices || devices.length === 0) {
    return renderNoDevices();
  }

  return (
    <Table>
      <Table.Head>
        <Table.SearchHeaderCell />
        <Table.TextHeaderCell>Manufacturer</Table.TextHeaderCell>
        <Table.TextHeaderCell>IEE Address</Table.TextHeaderCell>
      </Table.Head>
      <Table.Body height={240}>
        {devices.map(device => (
          <Table.Row
            key={device.ieeeAddr}
            isSelectable
            onSelect={(): void => console.log(device.modelID)}
          >
            <Table.TextCell>{device.modelID}</Table.TextCell>
            <Table.TextCell>{device.manufacturerName}</Table.TextCell>
            <Table.TextCell>{device.ieeeAddr}</Table.TextCell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
}
