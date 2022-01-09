import { DeviceModel, GroupModel, IEEEAddress } from '../../../common/types';
import { Heading, majorScale, Pane, SelectField } from 'evergreen-ui';
import React from 'react';
import { useQuery } from 'react-query';
import { DeviceResponse, DevicesService } from '../../actions/devices';
import { Error } from '../error';
import { DEVICES_QUERY_KEY } from './device-table';
import { renderSpinner } from '../common';
import { CoordinatorResponse, CoordinatorService } from '../../actions/coordinator';
import { COORDINATOR_QUERY_KEY } from '../../coordinator';
import { GroupResponse, GroupsServices } from '../../actions/groups';

interface Props {
  device: DeviceModel;
  allDevices?: DeviceModel[];
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EndpointsSelect(props: Props) {
  const [value, setValue] = React.useState('foo')
  return (
    <Pane>
      <SelectField label="Source endpoint" width="100%" value={value} onChange={event => setValue(event.target.value)}>
        {Object.keys(props.device.endpoints[0].clusters).map(clusterName => {
          return (<option key={clusterName} value={clusterName}>{clusterName}</option>)
        })}
      </SelectField>
    </Pane>
  )
}

interface DeviceSelectProps {
  allDevices: DeviceModel[];
  selected: IEEEAddress;
  cluster: number;
}

function DestDeviceSelect(props: DeviceSelectProps) {
  const [value, setValue] = React.useState(props.selected)
  return (
    <Pane>
      <SelectField label={`Cluster: ${props.cluster}, destination device`} width="100%" value={value} onChange={event => setValue(event.target.value)}>
        <option value="">None</option>
        {props.allDevices.map(d => {
          return (<option key={d.ieeeAddr} value={d.ieeeAddr}>{d.settings.friendlyName || d.ieeeAddr}</option>)
        })}
      </SelectField>
    </Pane>
  )
}

interface GroupSelectProps {
  selected: number;
  allGroups: GroupModel[];
  cluster: number;
}

function DestGroupSelect(props: GroupSelectProps) {
  const [value, setValue] = React.useState(props.selected)
  return (
    <Pane>
      <SelectField label={`Cluster: ${props.cluster}, destination group`} width="100%" value={value} onChange={event => setValue(parseInt(event.target.value))}>
        <option value="">None</option>
        {props.allGroups.map(g => {
          return (<option key={g.ID} value={g.ID}>{g.ID}</option>)
        })}
      </SelectField>
    </Pane>
  )
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function DestEndpointSelect(props: Props) {
  const [value, setValue] = React.useState('foo')
  return (
    <Pane>
      <SelectField label="Destination device" width="100%" value={value} onChange={event => setValue(event.target.value)}>
        {props.allDevices.map(d => {
          return (<option key={d.ieeeAddr} value={d.ieeeAddr}>{d.settings.friendlyName || d.ieeeAddr}</option>)
        })}
      </SelectField>
    </Pane>
  )
}

interface ExistingProps {
  device: DeviceModel;
  allDevices: DeviceModel[]
}

function ExistingBindings(props: ExistingProps) {
  const query = useQuery<GroupResponse>('groups', GroupsServices.fetchAll);
  const { device, allDevices } = props;
  const error = query.error as Error;
  return (
    <Pane>
      { device.endpoints.map(ep =>
        <Pane key={ep.ID}>
          {query.isError ? (
            <Error message={error.message} />
          ) : query.isFetching ? (
            renderSpinner()
          ) : (
            <>
              <Heading size={500} marginBottom={majorScale(1)}>Endpoint {ep.ID}</Heading>
              {ep.bindings.map(binding => (
                  <Pane key={binding.cluster}>
                    {binding.type === 'group' ?
                      <DestGroupSelect selected={binding.groupID} allGroups={query.data.groups} cluster={binding.cluster}/> :
                      <DestDeviceSelect selected={binding.deviceIeeeAddress} allDevices={allDevices} cluster={binding.cluster}/>
                    }
                  </Pane>
                ),
              )}
            </>
            )}
        </Pane>
      )}
    </Pane>
  );
}

export function DeviceBindings(props: Props) {
  const query = useQuery<DeviceResponse>(DEVICES_QUERY_KEY, DevicesService.fetchDevices);
  const coordinatorQuery = useQuery<CoordinatorResponse>(COORDINATOR_QUERY_KEY, CoordinatorService.fetch);
  const error: Error = query.error as Error || coordinatorQuery.error as Error;
  const isFetching = query.isFetching || coordinatorQuery.isFetching;
  const isError = query.isError || coordinatorQuery.isError;
  const devices = query.data.devices;
  const coordinator = coordinatorQuery.data?.coordinator;

  return (
    <Pane display="flex">
      {isError ? (
        <Error message={error.message} />
      ) : isFetching ? (
        renderSpinner()
      ) : (
        <Pane display="flex">
          <ExistingBindings device={props.device} allDevices={[...devices, coordinator]}/>
        </Pane>
      )}
    </Pane>
  )
}