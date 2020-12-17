import React, { ReactElement } from 'react';
import { Heading, Pane, Spinner, Table } from 'evergreen-ui';
import { useQuery } from 'react-query';
import { DeviceModel, DeviceResponse, DevicesService } from '../actions/devices';
import { Error } from './error';
import { useHistory } from 'react-router-dom';

function renderTable(devices: DeviceModel[], history) {
  return (
    <React.Fragment>
      {devices.map((device, index) => (
        <Table.Row
          key={index}
          isSelectable
          onSelect={() => history.push(`/devices/${device.ieeeAddr}`)}
        >
          <Table.TextCell>{device.modelID}</Table.TextCell>
          <Table.TextCell>{device.manufacturerName}</Table.TextCell>
          <Table.TextCell>{device.ieeeAddr}</Table.TextCell>
        </Table.Row>
      ))}
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

export default function DeviceTable(): ReactElement {
  const { isLoading, isError, data, error } = useQuery<DeviceResponse>(
    'devices',
    DevicesService.fetchDevices
  );
  const history = useHistory();

  if (isError) {
    return <Error message={error as string} />;
  }
  return (
    <React.Fragment>
      <Pane display="flex" flexDirection="column" justifyContent="stretch" width="100%">
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
            {isLoading ? renderSpinner() : renderTable(data?.devices || [], history)}
          </Table.Body>
        </Table>
      </Pane>
    </React.Fragment>
  );
}
