import React, { useState } from 'react';
import {
  Card,
  ForkIcon,
  Heading,
  InfoSignIcon,
  ListItem,
  Pane,
  Paragraph,
  Tab,
  Tablist,
  UnorderedList,
} from 'evergreen-ui';
import { DeviceModel } from '../../actions/devices';

const TABS = ['Info', 'Endpoints'];

interface Props {
  device: DeviceModel;
}

interface State {
  selectedTab: string;
}

function renderInfo(device: DeviceModel) {
  return (
    <Card backgroundColor="white" elevation={0} display="flex" flexDirection="column" padding={2}>
      <Pane padding={4}>
        <Heading size={400}>Manufacturer: {device.manufacturerName}</Heading>
      </Pane>
      <Pane padding={4}>
        <Heading size={400}>Manufacturer ID: {device.manufacturerID}</Heading>
      </Pane>
      <Pane padding={4}>
        <Heading size={400}>IEEE Address: {device.ieeeAddr}</Heading>
      </Pane>
    </Card>
  );
}

function renderEndpoints(device: DeviceModel) {
  return (
    <Card
      backgroundColor="white"
      elevation={0}
      height={240}
      display="flex"
      alignItems="top"
      justifyContent="stretch"
      flexDirection="column"
    >
      {device.endpoints.map(e => (
        <Paragraph key={e.ID}>
          <UnorderedList icon={ForkIcon} iconColor="success" key={e.ID}>
            <ListItem key={e.ID}>ID: {e.ID}</ListItem>
            <UnorderedList key={e.ID} icon={InfoSignIcon} iconColor="muted">
              {Object.keys(e.clusters).map(c => (
                <ListItem key={c}>
                  Cluster: {c} (values: {JSON.stringify(e.clusters[c])})
                </ListItem>
              ))}
            </UnorderedList>
          </UnorderedList>
        </Paragraph>
      ))}
    </Card>
  );
}

function renderSelectedTab(selectedTab: string, device: DeviceModel) {
  switch (selectedTab) {
    case 'Info':
      return renderInfo(device);
    case 'Endpoints':
      return renderEndpoints(device);
  }
}

export function DeviceDetailsBody(props: Props) {
  const { device } = props;
  const [state, setState] = useState<State>({ selectedTab: TABS[0] });
  return (
    <React.Fragment>
      <Pane padding={16} borderBottom="muted">
        <Heading size={600}>
          {device.manufacturerName} {device.modelID}
        </Heading>
        <Paragraph size={400} color="muted">
          Type: {device.type}
        </Paragraph>
      </Pane>
      <Pane display="flex" padding={8} flexDirection="column">
        <Tablist>
          {TABS.map(tab => (
            <Tab
              key={tab}
              isSelected={state.selectedTab === tab}
              onSelect={() => setState({ ...state, selectedTab: tab })}
            >
              {tab}
            </Tab>
          ))}
        </Tablist>
        <Pane flex="1" overflowY="scroll" background="tint1" padding={4} flexDirection="column">
          {renderSelectedTab(state.selectedTab, device)}
        </Pane>
      </Pane>
    </React.Fragment>
  );
}
