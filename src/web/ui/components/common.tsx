import { Pane, Spinner } from 'evergreen-ui';
import React from 'react';

export function renderSpinner() {
  return (
    <Pane display='flex' alignItems='center' justifyContent='center' height='100%'>
      <Spinner />
    </Pane>
  );
}
