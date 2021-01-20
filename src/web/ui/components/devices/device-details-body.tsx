import React, { useState } from 'react';
import { Button, Card, Dialog, Heading, Pane, Paragraph, Tab, TabNavigation } from 'evergreen-ui';
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
  isUpdateShown: boolean;
}

function isCoordinator(device: DeviceModel) {
  return device.type === 'Coordinator';
}

function renderInfo(device: DeviceModel, showUpdateDialog: () => void) {
  let otaInfo = null;
  if (device.otaAvailable) {
    if (device.newFirmwareAvailable) {
      otaInfo = (
        <Pane padding={sizes.padding.small} paddingTop={sizes.padding.large} background="tealTint">
          <Heading size={400}>A new firmware version is available for this device!</Heading>
          <p>
            <Button
              height={32}
              appearance="primary"
              marginRight={16}
              intent="warning"
              onClick={() => showUpdateDialog()}
            >
              Update!
            </Button>
          </p>
        </Pane>
      );
    } else {
      otaInfo = (
        <Pane padding={sizes.padding.small}>
          <Heading size={400}>This device is updated to the latest available firmware</Heading>
        </Pane>
      );
    }
  }

  return (
    <React.Fragment>
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
        <Heading size={400}>Link quality: {device.linkquality} lqi</Heading>
      </Pane>
      <Pane padding={sizes.padding.small}>
        <Heading size={400}>Last seen: {dayjs(device.lastSeen).fromNow(false)}</Heading>
      </Pane>
      {otaInfo}
    </React.Fragment>
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

function renderSelectedTab(selectedTab: string, device: DeviceModel, showUpdateDialog: () => void) {
  let content = null;
  switch (selectedTab) {
    case 'Info':
      content = isCoordinator(device)
        ? renderCoordinatorInfo(device as CoordinatorModel)
        : renderInfo(device, showUpdateDialog);
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
  const [state, setState] = useState<State>({
    selectedTab: TABS[0],
    isLoadingState: false,
    isUpdateShown: false,
  });
  const showUpdateDialog = () => setState({ ...state, isUpdateShown: true });
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
        {renderSelectedTab(state.selectedTab, device, showUpdateDialog)}
        <Dialog
          isShown={state.isUpdateShown}
          title={`Upgrade firmware for ${device.manufacturerName} ${device.modelID}`}
          onCloseComplete={() => setState({ ...state, isUpdateShown: false })}
          confirmLabel="Start"
        >
          Update firmware
        </Dialog>
      </Pane>
    </Pane>
  );
}
