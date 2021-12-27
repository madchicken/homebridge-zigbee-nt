import React, { useState } from 'react';
import { Button, Card, Heading, minorScale, Pane, Paragraph, Tab, TabNavigation } from 'evergreen-ui';
import ReactJson from 'react-json-view';
import { sizes } from '../constants';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { CoordinatorModel, DeviceModel } from '../../../common/types';
import { DevicesService } from '../../actions/devices';

dayjs.extend(relativeTime);

const COORDINATOR_TABS = ['Info', 'Structure'];

interface Props {
  device: CoordinatorModel;
  refresh: () => void;
}

interface State {
  selectedTab: string;
  isLoadingState: boolean;
  permitJoin: boolean;
  error?: string;
}

function togglePermitJoin(device: CoordinatorModel, state: State, setState: React.Dispatch<State>) {
  const fn = state.permitJoin ? DevicesService.stopPermitJoin : DevicesService.startPermitJoin;
  setState({ ...state, isLoadingState: true })
  fn().then((res) => setState({ ...state, permitJoin: res.permitJoin, isLoadingState: false }));
}

function renderCoordinatorInfo(device: CoordinatorModel, state: State, setState: React.Dispatch<State>) {
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
      <Pane padding={sizes.padding.small}>
        <Button marginRight={minorScale(3)} isLoading={state.isLoadingState} onClick={() => togglePermitJoin(device, state, setState)}>{state.permitJoin ? 'Stop Joining' : 'Allow Joining'}</Button>
      </Pane>
    </>
  );
}

function renderDeviceStructure(device: DeviceModel) {
  return (
    <ReactJson src={device} onAdd={false} onDelete={false} onEdit={false} enableClipboard={true} />
  );
}

function renderSelectedTab(state: State, device: CoordinatorModel, setState: React.Dispatch<State>) {
  let content = null;
  switch (state.selectedTab) {
    case 'Info':
      content = renderCoordinatorInfo(device, state, setState);
      break;
    case 'Structure':
      content = renderDeviceStructure(device);
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

export function CoordinatorDetailsBody(props: Props) {
  const { device } = props;
  const [state, setState] = useState<State>({ selectedTab: COORDINATOR_TABS[0], isLoadingState: false, permitJoin: device.permitJoin });
  return (
    <Pane height="100%">
      <Pane padding={sizes.padding.large} borderBottom="muted" height={`${sizes.header.medium}px`}>
        <Heading size={600}>
          Main device
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
          {(COORDINATOR_TABS).map(tab => (
            <Tab
              key={tab}
              isSelected={state.selectedTab === tab}
              onSelect={() => setState({ ...state, selectedTab: tab })}
            >
              {tab}
            </Tab>
          ))}
        </TabNavigation>
        {renderSelectedTab(state, device, setState)}
      </Pane>
    </Pane>
  );
}
