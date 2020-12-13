import { Heading, Pane, Paragraph, Tab, Tablist, Card, TextInputField } from 'evergreen-ui';
import React, { ReactElement, useState } from 'react';
import { DeviceModel } from '../actions/devices';

interface Props {
  device: DeviceModel;
}

function renderInfo(device: DeviceModel) {
  return (
    <Card backgroundColor="white" elevation={0} display="flex" flexDirection="column" padding={2}>
      <Pane padding={4}>
        <Heading size={300}>Manufacturer: {device.manufacturerName}</Heading>
      </Pane>
      <Pane padding={4}>
        <Heading size={300}>Manufacturer ID: {device.manufacturerID}</Heading>
      </Pane>
      <Pane padding={4}>
        <Heading size={300}>IEEE Address: {device.ieeeAddr}</Heading>
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
      justifyContent="left"
    >
      <Heading>Endpoints</Heading>
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

const TABS = ['Info', 'Endpoints'];

export function DeviceDetails(props: Props): ReactElement {
  const [state, setState] = useState({ selectedTab: 'Info' });
  if (props.device) {
    const device = props.device;
    return (
      <React.Fragment>
        <Pane zIndex={1} flexShrink={0} elevation={0} backgroundColor="white">
          <Pane padding={16} borderBottom="muted">
            <Heading size={600}>
              {device.manufacturerName} {device.modelID}
            </Heading>
            <Paragraph size={400} color="muted">
              {device.type}
            </Paragraph>
          </Pane>
          <Pane display="flex" padding={8} flexDirection="column">
            <Tablist>
              {TABS.map(tab => (
                <Tab
                  key={tab}
                  isSelected={state.selectedTab === tab}
                  onSelect={() => setState({ selectedTab: tab })}
                >
                  {tab}
                </Tab>
              ))}
            </Tablist>
            <Pane flex="1" overflowY="scroll" background="tint1" padding={4} flexDirection="column">
              {renderSelectedTab(state.selectedTab, device)}
            </Pane>
          </Pane>
        </Pane>
      </React.Fragment>
    );
  }
  return null;
}
