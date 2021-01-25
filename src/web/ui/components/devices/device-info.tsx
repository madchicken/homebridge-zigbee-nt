import { DeviceModel } from '../../../common/types';
import { Button, Heading, Pane, Paragraph } from 'evergreen-ui';
import { sizes } from '../constants';
import { isDeviceRouter } from '../../../../utils/device';
import React, { useState } from 'react';
import dayjs from 'dayjs';
import { DevicesService } from '../../actions/devices';
import { DeviceUpdate } from './device-update';

interface Props {
  device: DeviceModel;
  refresh: () => void;
}

interface State {
  isLoadingState: boolean;
  isUpdateShown: boolean;
  pingError?: string;
}

export function DeviceInfo(props: Props) {
  const { device } = props;
  const [state, setState] = useState<State>({
    isLoadingState: false,
    isUpdateShown: false,
    pingError: null,
  });
  const showUpdateDialog = (isShown: boolean) => setState({ ...state, isUpdateShown: isShown });
  const pingDevice = async () => {
    try {
      setState({ ...state, isLoadingState: true });
      await DevicesService.pingDevice(device.ieeeAddr);
    } catch (e) {
      setState({ ...state, pingError: e.message });
    } finally {
      setState({ ...state, isLoadingState: false });
    }
  };

  function otaInfoPanel() {
    let otaInfo = null;
    if (device.otaAvailable) {
      if (device.newFirmwareAvailable === 'YES') {
        otaInfo = (
          <Pane
            padding={sizes.padding.small}
            paddingTop={sizes.padding.large}
            background="tealTint"
          >
            <Heading size={400}>A new firmware version is available for this device!</Heading>
            <p>
              <Button
                height={32}
                appearance="primary"
                marginRight={16}
                intent="warning"
                isLoading={state.isLoadingState}
                onClick={() => showUpdateDialog(true)}
              >
                Update!
              </Button>
            </p>
            <DeviceUpdate
              device={device}
              isShown={state.isUpdateShown}
              onClose={async () => {
                showUpdateDialog(false);
                props.refresh();
              }}
            />
          </Pane>
        );
      } else if (device.newFirmwareAvailable === 'NO') {
        otaInfo = (
          <Pane padding={sizes.padding.small}>
            <Heading size={400}>This device is updated to the latest available firmware</Heading>
          </Pane>
        );
      } else {
        otaInfo = (
          <Pane padding={sizes.padding.small}>
            <Paragraph>{state.pingError}</Paragraph>
            <Heading size={400}>Error fetching OTA info: {device.newFirmwareAvailable}</Heading>
            {isDeviceRouter(device) && (
              <Button
                height={32}
                appearance="primary"
                marginRight={16}
                intent="warning"
                onClick={() => pingDevice()}
              >
                Ping device
              </Button>
            )}
          </Pane>
        );
      }
    }
    return otaInfo;
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
      {otaInfoPanel()}
    </React.Fragment>
  );
}
