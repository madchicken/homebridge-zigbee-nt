import React, { useState } from 'react';
import {
  Button,
  Card,
  Heading,
  Label,
  Pane,
  Paragraph,
  Tab,
  Tablist,
  Textarea,
} from 'evergreen-ui';
import { DeviceModel } from '../../actions/devices';
import ReactJson from 'react-json-view';

const TABS = ['Info', 'Endpoints', 'State'];

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
      height={500}
      display="flex"
      alignItems="top"
      justifyContent="stretch"
      flexDirection="column"
    >
      <ReactJson src={device} onAdd={false} onDelete={false} onEdit={false} />
    </Card>
  );
}

function renderCustomState(_device: DeviceModel) {
  const placeholder = `{
    "brightness": 128
  }`;
  return (
    <Card
      backgroundColor="white"
      elevation={0}
      height={400}
      display="flex"
      alignItems="top"
      justifyContent="stretch"
      flexDirection="column"
    >
      <Pane>
        <Label htmlFor="textarea-2" marginBottom={4} display="block">
          Set custom state
        </Label>
        <Textarea id="textarea-2" placeholder={placeholder} />
        <Button appearance="primary" onClick={() => {}}>
          Send
        </Button>
      </Pane>
    </Card>
  );
}

function renderSelectedTab(selectedTab: string, device: DeviceModel) {
  switch (selectedTab) {
    case 'Info':
      return renderInfo(device);
    case 'Endpoints':
      return renderEndpoints(device);
    case 'State':
      return renderCustomState(device);
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
