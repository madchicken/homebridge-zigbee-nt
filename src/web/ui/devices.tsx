import React, { ReactElement } from 'react';
import DeviceTable from './components/device-table';
import { Card } from 'evergreen-ui';

export function Devices(): ReactElement {
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
      <DeviceTable />
    </Card>
  );
}
