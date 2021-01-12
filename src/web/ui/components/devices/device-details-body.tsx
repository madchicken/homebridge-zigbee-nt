import React, { useState } from 'react';
import { Card, Heading, Pane, Paragraph, Tab, TabNavigation } from 'evergreen-ui';
import ReactJson from 'react-json-view';
import { DeviceStateManagement } from './device-state-management';
import { sizes } from '../constants';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CoordinatorModel, DeviceModel } from '../../../common/types';
dayjs.extend(relativeTime);

const TABS = ['Info', 'Endpoints', 'State'];
const COORDINATOR_TABS = ['Info', 'Endpoints'];

interface Props {
  device: DeviceModel;
}

interface State {
  selectedTab: string;
  isLoadingState: boolean;
}

function isCoordinator(device: DeviceModel) {
  return device.type === 'Coordinator';
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
        <Heading size={400}>Link quality: {device.linkquality}</Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>Last seen: {dayjs(device.lastSeen).fromNow(false)}</Heading>
      </Pane>
    </>
  );
}

function renderCoordinatorInfo(device: CoordinatorModel) {
  return (
    <>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>IEEE Address: {device.ieeeAddr}</Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>
          Version: {device.meta.majorrel}.{device.meta.minorrel} (rev. {device.meta.revision})
        </Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>
          Transport Version: {device.meta.maintrel} (rev. {device.meta.transportrev})
        </Heading>
      </Pane>
    </>
  );
}

function renderEndpoints(device: DeviceModel) {
  const endpoints = device.endpoints;
  return (
    <ReactJson
      src={endpoints}
      onAdd={false}
      onDelete={false}
      onEdit={false}
      enableClipboard={false}
    />
  );
}

function renderCustomState(device: DeviceModel) {
  return <DeviceStateManagement device={device} />;
}

function renderSelectedTab(selectedTab: string, device: DeviceModel) {
  let content = null;
  switch (selectedTab) {
    case 'Info':
      content = isCoordinator(device)
        ? renderCoordinatorInfo(device as CoordinatorModel)
        : renderInfo(device);
      break;
    case 'Endpoints':
      content = renderEndpoints(device);
      break;
    case 'State':
      content = renderCustomState(device);
      break;
  }

  return (
    <Card
      backgroundColor="white"
      elevation={2}
      display="flex"
      flexDirection="column"
      padding={sizes.padding.small}
      height="100%"
    >
      {content}
    </Card>
  );
}

export function DeviceDetailsBody(props: Props) {
  const { device } = props;
  const [state, setState] = useState<State>({ selectedTab: TABS[0], isLoadingState: false });
  return (
    <Pane height="100%">
      <Pane padding={sizes.padding.large} borderBottom="muted" height={`${sizes.header.medium}px`}>
        <Heading size={600}>
          {device.manufacturerName} {device.modelID}
        </Heading>
        <Paragraph size={400} color="muted">
          Type: {device.type}
        </Paragraph>
      </Pane>
      <Pane
        display="flex"
        padding={sizes.padding.large}
        flexDirection="column"
        height={`calc(100% - ${sizes.header.medium}px)`}
      >
        <TabNavigation marginBottom={sizes.margin.medium}>
          {(isCoordinator(device) ? COORDINATOR_TABS : TABS).map(tab => (
            <Tab
              key={tab}
              isSelected={state.selectedTab === tab}
              onSelect={() => setState({ ...state, selectedTab: tab })}
            >
              {tab}
            </Tab>
          ))}
        </TabNavigation>
        {renderSelectedTab(state.selectedTab, device)}
      </Pane>
    </Pane>
  );
}
