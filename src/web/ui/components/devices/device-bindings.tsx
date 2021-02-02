import { ALLOWED_CLUSTERS, Binding, DeviceModel } from '../../../common/types';
import { EditIcon, Heading, IconButton, Pane, Table, TrashIcon } from 'evergreen-ui';
import { sizes } from '../constants';
import React, { useState } from 'react';
import { DevicesService } from '../../actions/devices';
import { DeviceBindingDialog } from './device-binding-dialog';

interface Props {
  device: DeviceModel;
}

interface State {
  isWorking: boolean;
  isEditing: boolean;
  isUpdateShown: boolean;
  pingError?: string;
  deviceClusters?: string[];
  selectedRow?: BindingRow;
  rowIndex?: number;
  target?: string;
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
    isEditing: false,
  });

  async function deleteBinding(binding: BindingRow) {
    setState({ ...state, isWorking: true });
    const endpoint = device.endpoints.find(e => e.ID === binding.endpointID);
    console.log('Unbinding endpoint ', endpoint);
    await DevicesService.unbind(
      device.ieeeAddr,
      binding.deviceIeeeAddress || 'default_bind_group',
      ALLOWED_CLUSTERS
    );
    setState({ ...state, isWorking: false });
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
              <Table.Row key={index}>
                <Table.TextCell>{row.endpointID}</Table.TextCell>
                <Table.TextCell>{row.type}</Table.TextCell>
                <Table.TextCell>
                  {row.type === 'group' ? row.groupID : row.deviceIeeeAddress}
                </Table.TextCell>
                <Table.TextCell>
                  <Pane float="left" marginRight={16}>
                    <IconButton
                      icon={TrashIcon}
                      iconSize={16}
                      intent="danger"
                      onClick={() => deleteBinding(row)}
                      appearance={'minimal'}
                    />
                    <IconButton
                      icon={EditIcon}
                      iconSize={16}
                      onClick={() =>
                        setState({ ...state, isEditing: true, selectedRow: row, rowIndex: index })
                      }
                      appearance={'minimal'}
                    />
                  </Pane>
                </Table.TextCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
      {state.isEditing && (
        <DeviceBindingDialog
          isShown={state.isEditing}
          device={device}
          isNew={false}
          currentBindings={device.endpoints.find(e => e.ID === state.selectedRow.endpointID).binds}
          bindingIndex={state.rowIndex}
          onClose={() => setState({ ...state, isEditing: false })}
        />
      )}
    </Pane>
  );
}
