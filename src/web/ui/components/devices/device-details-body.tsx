import React, { useState } from 'react';
import {
  Button,
  Card,
  Heading,
  Pane,
  Paragraph,
  Tab,
  TabNavigation,
  TextInput,
} from 'evergreen-ui';
import ReactJson from 'react-json-view';
import { DeviceStateManagement } from './device-state-management';
import { sizes } from '../constants';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { DeviceModel } from '../../../common/types';
import { useQuery } from 'react-query';
import { DevicesService } from '../../actions/devices';
import { DeviceBindings } from './device-bindings';

dayjs.extend(relativeTime);

const TABS = [{ value: 'info', label: 'Info' }, { value: 'structure', label: 'Structure' }, { value: 'state', label: 'State' }, { value: 'bindings', label: 'Bindings' }];

interface Props {
  device: DeviceModel;
  refresh: () => void;
}

interface State {
  selectedTab: string;
  isLoadingState: boolean;
}

interface UpdateNameState {
  isUpdating: boolean;
  error: null;
  friendlyName: string;
}

interface UpdateFirmwareState {
  isUpdating: boolean;
  error: null;
}

async function updateFriendlyName(setState: React.Dispatch<UpdateNameState>, state: UpdateNameState, props: Partial<Props>) {
  setState({ ...state, isUpdating: true });
  const settings = {
    ...props.device.settings,
    friendlyName: state.friendlyName,
  };
  DevicesService.updateSettings(props.device.ieeeAddr, settings)
    .catch(e => setState({ ...state, error: e.message }))
    .finally(() => setState({ ...state, isUpdating: false }));
}

function FriendlyNameTextInputExample(props: Partial<Props>) {
  const [state, setState] = useState({
    friendlyName: props.device.settings.friendlyName,
    isUpdating: false,
    error: null,
  });
  return (
    <Heading size={400}>
      <Pane display="flex">
        <Pane width="100%" display="flex"><Pane width="50%">Friendly Name:</Pane><TextInput width="100%" height={32} placeholder="Change friendly name for this device" isInvalid={!!state.error} onChange={e => setState({
          ...state, friendlyName: e.target.value,
        })} value={state.friendlyName}/></Pane>
        <Button size='medium'
                onClick={() => updateFriendlyName(setState, state, props)}
                isLoading={state.isUpdating}>Update</Button>
      </Pane>
    </Heading>
  );
}

function renderInfo(device: DeviceModel) {
  return (
    <>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>Manufacturer: {device.manufacturerName}</Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>Manufacturer ID: {device.manufacturerID}</Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>IEEE Address: {device.ieeeAddr}</Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>Software build: {device.softwareBuildID}</Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>Update available: <CheckForUpdates ieeeAddr={device.ieeeAddr} /></Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>Link quality: {device.linkquality}</Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>Last seen: {dayjs(device.lastSeen).fromNow(false)}</Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <FriendlyNameTextInputExample device={device} />
      </Pane>
    </>
  );
}

function CheckForUpdates(props: { ieeeAddr: string }): JSX.Element | null {
  const { ieeeAddr } = props;
  const checkForUpdatesQuery = useQuery(['deviceUpdates', ieeeAddr], () => DevicesService.checkForUpdates(ieeeAddr));
  const [state, setState] = useState<UpdateFirmwareState>({ isUpdating: false, error: null });

  if (checkForUpdatesQuery.isError) {
    return <>{(checkForUpdatesQuery.error as Error).message}</>;
  } else if (checkForUpdatesQuery.isFetched) {
    if (checkForUpdatesQuery.data) {
      return <>
        Update available <Button isLoading={state.isUpdating} appearance="primary" intent="danger" onClick={async () => {
          setState({...state, isUpdating: true});
        try {
          await DevicesService.updateFirmware(ieeeAddr);
          setState({...state, isUpdating: false});
        } catch (e) {
          setState({...state, isUpdating: false, error: e.message});
        }
        setState({...state, isUpdating: false});
      }}>Update now</Button>
      </>;
    } else {
      return <>No update available</>;
    }
  } else {
    return <>{checkForUpdatesQuery.status}</>;
  }
}

function renderDeviceStructure(device: DeviceModel) {
  return (
    <ReactJson src={device} onAdd={false} onDelete={false} onEdit={false} enableClipboard={true} />
  );
}

function renderCustomState(device: DeviceModel) {
  return <DeviceStateManagement device={device} />;
}

function renderDeviceBindings(device: DeviceModel) {
  return <DeviceBindings device={device} />;
}

function renderSelectedTab(selectedTab: string, device: DeviceModel) {
  let content = null;
  switch (selectedTab) {
    case 'info':
      content = renderInfo(device);
      break;
    case 'structure':
      content = renderDeviceStructure(device);
      break;
    case 'state':
      content = renderCustomState(device);
      break;
    case 'bindings':
      content = renderDeviceBindings(device);
      break;
  }

  return (
    <Card
      backgroundColor='white'
      elevation={2}
      display='flex'
      flexDirection='column'
      padding={sizes.padding.small}
      height='100%'
    >
      {content}
    </Card>
  );
}

export function DeviceDetailsBody(props: Props) {
  const { device } = props;
  const options = [ ...TABS ];
  const [state, setState] = useState<State>({ selectedTab: options[0].value, isLoadingState: false });
  return (
    <Pane height='100%'>
      <Pane padding={sizes.padding.large} borderBottom='muted' height={`${sizes.header.large}px`}>
        <Heading size={600}>
          {device.manufacturerName} {device.modelID}
        </Heading>
        <Paragraph size={400} color='muted'>
          Type: {device.type}
        </Paragraph>
      </Pane>
      <Pane
        display='flex'
        padding={sizes.padding.large}
        flexDirection='column'
        height={`calc(100% - ${sizes.header.medium}px)`}
      >
        <TabNavigation marginBottom={sizes.margin.medium}>
          {options.map(tab => (
            <Tab
              key={tab.value}
              isSelected={state.selectedTab === tab.value}
              onSelect={() => setState({ ...state, selectedTab: tab.value })}
              appearance="primary"
            >
              {tab.label}
            </Tab>
          ))}
        </TabNavigation>
        {renderSelectedTab(state.selectedTab, device)}
      </Pane>
    </Pane>
  );
}
