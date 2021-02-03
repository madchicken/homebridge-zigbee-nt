import { DeviceModel } from '../../../common/types';
import { Button, Heading, Pane, Paragraph, WarningSignIcon } from 'evergreen-ui';
import { sizes } from '../constants';
import React, { useCallback, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DevicesService } from '../../actions/devices';
import { DeviceUpdate } from './device-update';
import { isDeviceRouter } from '../../../../utils/device';

interface Props {
  device: DeviceModel;
  refresh: () => void;
}

interface State {
  isLoadingState: boolean;
  isUpdateShown: boolean;
  pingError?: string;
  otaCheck?: number;
  newFirmwareAvailable?: 'YES' | 'NO' | 'FETCH_ERROR';
}

export function DeviceInfo(props: Props) {
  const { device } = props;
  const [state, setState] = useState<State>({
    isLoadingState: false,
    isUpdateShown: false,
    pingError: null,
  });
  const { isLoadingState, isUpdateShown, otaCheck, pingError, newFirmwareAvailable } = state;

  const showUpdateDialog = useCallback(
    (isShown: boolean) => setState({ ...state, isUpdateShown: isShown }),
    [state, setState, device.ieeeAddr]
  );
  const pingDevice = useCallback(async () => {
    try {
      setState({ ...state, isLoadingState: true });
      await DevicesService.pingDevice(device.ieeeAddr);
    } catch (e) {
      setState({ ...state, pingError: e.message });
    } finally {
      setState({ ...state, isLoadingState: false });
    }
  }, [state, setState, device.ieeeAddr]);

  async function checkForUpdates() {
    try {
      setState({ ...state, isLoadingState: true });
      const resp = await DevicesService.checkForUpdates(device.ieeeAddr);
      console.log(resp);
      setState({
        ...state,
        otaCheck: Date.now(),
        newFirmwareAvailable: resp.state.newFirmwareAvailable,
        isLoadingState: false,
      });
    } catch (e) {
      setState({ ...state, pingError: e.message, isLoadingState: false });
    }
  }

  const otaInfoPanel = useMemo(() => {
    if (!otaCheck || newFirmwareAvailable === 'FETCH_ERROR') {
      return (
        <Pane padding={sizes.padding.small} paddingTop={sizes.padding.large} background="tealTint">
          <Heading size={400}>
            Check for new firmware{' '}
            {newFirmwareAvailable === 'FETCH_ERROR' ? (
              <WarningSignIcon color="warning" marginRight={16} title="Last check failed" />
            ) : null}
          </Heading>
          <p>
            <Button
              height={32}
              appearance="primary"
              marginRight={16}
              intent="warning"
              isLoading={isLoadingState}
              onClick={() => checkForUpdates()}
            >
              Check for updates
            </Button>
          </p>
        </Pane>
      );
    }

    if (newFirmwareAvailable) {
      if (newFirmwareAvailable === 'YES') {
        return (
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
                isLoading={isLoadingState}
                onClick={() => showUpdateDialog(true)}
              >
                Update!
              </Button>
            </p>
            <DeviceUpdate
              device={device}
              isShown={isUpdateShown}
              onClose={async () => {
                showUpdateDialog(false);
                refresh();
              }}
            />
          </Pane>
        );
      } else if (newFirmwareAvailable === 'NO') {
        return (
          <Pane padding={sizes.padding.small}>
            <Heading size={400}>This device is updated to the latest available firmware</Heading>
          </Pane>
        );
      } else {
        return (
          <Pane padding={sizes.padding.small}>
            <Paragraph>{pingError}</Paragraph>
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
  }, [
    newFirmwareAvailable,
    isLoadingState,
    isUpdateShown,
    otaCheck,
    pingError,
    pingDevice,
    refresh,
    showUpdateDialog,
  ]);

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
      {otaInfoPanel}
    </React.Fragment>
  );
}
