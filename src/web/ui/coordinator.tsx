import { Pane, Spinner } from 'evergreen-ui';
import React from 'react';
import { useQuery } from 'react-query';
import { CoordinatorResponse, CoordinatorService } from './actions/coordinator';
import { Error } from './components/error';
import { CoordinatorDetailsBody } from './components/devices/coordinator-details-body';

export const COORDINATOR_QUERY_KEY = 'coordinator';
export function Coordinator() {
  const queryResult = useQuery<CoordinatorResponse>(COORDINATOR_QUERY_KEY, () =>
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
      <CoordinatorDetailsBody device={queryResult.data.coordinator} refresh={() => {}} />
    </Pane>
  );
}
