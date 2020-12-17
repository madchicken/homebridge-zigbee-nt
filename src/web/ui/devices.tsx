import React, { ReactElement, useMemo } from 'react';
import DeviceTable from './components/device-table';
import { Card } from 'evergreen-ui';
import { DeviceDetails } from './components/device-details';
import { useLocation } from 'react-router-dom';

export function Devices(): ReactElement {
  const location = useLocation();
  const ieeeAddr = location.pathname.substr(
    location.pathname.lastIndexOf('/devices/') + '/devices/'.length
  );
  const detailsOpen = useMemo(() => !!ieeeAddr, [ieeeAddr]);
  return (
    <Card
      display="flex"
      alignItems="stretch"
      justifyContent="stretch"
      borderTop
      borderRight
      borderLeft
      borderBottom
      elevation={2}
    >
      {detailsOpen && <DeviceDetails ieeeAddr={ieeeAddr} />}
      <DeviceTable />
    </Card>
  );
}
