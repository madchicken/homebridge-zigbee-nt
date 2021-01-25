import { Binding, DeviceModel } from '../../../common/types';
import { Heading, IconButton, Pane, Table, TrashIcon } from 'evergreen-ui';
import { sizes } from '../constants';
import React, { useState } from 'react';
import { DevicesService } from '../../actions/devices';

interface Props {
  device: DeviceModel;
}

interface State {
  isWorking: boolean;
  isUpdateShown: boolean;
  pingError?: string;
}

interface BindingRow extends Binding {
  endpointID: number;
}

export function DeviceBindings(props: Props) {
  const { device } = props;
  const [state, setState] = useState<State>({
    isWorking: false,
    isUpdateShown: false,
    pingError: null,
  });

  function deleteBinding(binding: BindingRow) {
    setState({ ...state, isWorking: true });
    const endpoint = device.endpoints.find(e => e.ID === binding.endpointID);
    DevicesService.unbind(
      device.ieeeAddr,
      binding.deviceIeeeAddress,
      Object.keys(endpoint.clusters)
    );
  }

  const rows: BindingRow[] = [];
  device.endpoints.reduce((bindings, endpoint) => {
    if (endpoint.binds && endpoint.binds.length) {
      bindings.push(...endpoint.binds.map(b => ({ ...b, endpointID: endpoint.ID })));
    }
    return bindings;
  }, rows);

  const size = 600;
  return (
    <Pane display="flex" flexDirection="column" justifyContent="stretch" width="100%" height="100%">
      <Pane padding={sizes.padding.large} borderBottom="muted" height={`${sizes.header.medium}px`}>
        <Heading size={size}>Active Bindings</Heading>
      </Pane>
      <Table height={`calc(100% - ${sizes.header.medium}px)`}>
        <Table.Head>
          <Table.TextHeaderCell>Endpoint ID</Table.TextHeaderCell>
          <Table.TextHeaderCell>Type</Table.TextHeaderCell>
          <Table.TextHeaderCell>Target</Table.TextHeaderCell>
          <Table.TextHeaderCell>Actions</Table.TextHeaderCell>
        </Table.Head>
        <Table.Body height="100%">
          {rows.map((row, index) => {
            return (
              <Table.Row key={index} isSelectable onSelect={() => {}}>
                <Table.TextCell>{row.endpointID}</Table.TextCell>
                <Table.TextCell>{row.type}</Table.TextCell>
                <Table.TextCell>
                  {row.type === 'group' ? row.groupID : row.deviceIeeeAddress}
                </Table.TextCell>
                <Table.TextCell>
                  <IconButton
                    icon={TrashIcon}
                    iconSize={16}
                    intent="danger"
                    onClick={() => deleteBinding(row)}
                  />
                </Table.TextCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </Pane>
  );
}
