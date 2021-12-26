import React, { ReactElement } from 'react';
import { Heading, Pane, Pill, Spinner, Table } from 'evergreen-ui';
import { useQuery } from 'react-query';
import { DeviceResponse, DevicesService } from '../../actions/devices';
import { Error } from '../error';
import { useHistory } from 'react-router-dom';
import dayjs from 'dayjs';
import { sizes } from '../constants';
import { DeviceModel } from '../../../common/types';

type Color =
  | 'automatic'
  | 'neutral'
  | 'blue'
  | 'red'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'teal'
  | 'purple';

function renderTable(devices: DeviceModel[], history) {
  return (
    <React.Fragment>
      {devices.map((device, index) => {
        const qualityPercent = Math.round(
          device.linkquality ? (device.linkquality / 2.55) : 0
        );
        let color: Color = 'green';
        if (qualityPercent < 4) {
          color = 'red';
        } else if (qualityPercent < 20) {
          color = 'orange';
        } else if (qualityPercent < 50) {
          color = 'yellow';
        }
        return (
          <Table.Row
            key={index}
            isSelectable
            onSelect={() => history.push(`/devices/${device.ieeeAddr}`)}
          >
            <Table.TextCell>{device.modelID}</Table.TextCell>
            <Table.TextCell>{device.manufacturerName}</Table.TextCell>
            <Table.TextCell>{device.ieeeAddr}</Table.TextCell>
            <Table.TextCell>{device.settings.friendlyName}</Table.TextCell>
            <Table.TextCell>{device.powerSource}</Table.TextCell>
            <Table.TextCell>
              <Pill color={color}>{qualityPercent ? `${qualityPercent} %` : 'disconnected'}</Pill>
            </Table.TextCell>
            <Table.TextCell>
              {dayjs(device.lastSeen).format('MMMM D, YYYY h:mm:ss A')}
            </Table.TextCell>
          </Table.Row>
        );
      })}
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

export const DEVICES_QUERY_KEY = 'devices';
export default function DeviceTable(): ReactElement {
  const res = useQuery<DeviceResponse>(DEVICES_QUERY_KEY, DevicesService.fetchDevices);
  const { isLoading, isError, data } = res;
  const error: Error = res.error as Error;
  const history = useHistory();

  const size = 600;
  return (
    <Pane display="flex" flexDirection="column" justifyContent="stretch" width="100%" height="100%">
      <Pane padding={sizes.padding.large} borderBottom="muted" height={`${sizes.header.medium}px`}>
        <Heading size={size}>Paired devices</Heading>
      </Pane>
      <Table height={`calc(100% - ${sizes.header.medium}px)`}>
        <Table.Head>
          <Table.TextHeaderCell>Model ID</Table.TextHeaderCell>
          <Table.TextHeaderCell>Manufacturer</Table.TextHeaderCell>
          <Table.TextHeaderCell>IEEE Address</Table.TextHeaderCell>
          <Table.TextHeaderCell>Friendly name</Table.TextHeaderCell>
          <Table.TextHeaderCell>Power source</Table.TextHeaderCell>
          <Table.TextHeaderCell>Link Quality</Table.TextHeaderCell>
          <Table.TextHeaderCell>Last seen</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body height="100%">
          {isError ? (
            <Error message={error.message} />
          ) : isLoading ? (
            renderSpinner()
          ) : (
            renderTable(data?.devices || [], history)
          )}
        </Table.Body>
      </Table>
    </Pane>
  );
}
