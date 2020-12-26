import { Pane, Spinner } from 'evergreen-ui';
import React from 'react';
import { useQuery } from 'react-query';
import { CoordinatorResponse, CoordinatorService } from './actions/coordinator';
import { DeviceDetailsBody } from './components/devices/device-details-body';
import { Error } from './components/error';

export function Coordinator() {
  const queryResult = useQuery<CoordinatorResponse>(['coordinator'], () =>
    CoordinatorService.fetch()
  );
  if (queryResult.isError || queryResult.data?.error) {
    return <Error message={queryResult.data.error} />;
  }

  if (queryResult.isLoading) {
    return (
      <Pane display="flex" alignItems="center" justifyContent="center" height="100%">
        <Spinner />
      </Pane>
    );
  }

  return (
    <Pane>
      <DeviceDetailsBody device={queryResult.data.coordinator} />
    </Pane>
  );
}
