import React, { ReactElement } from 'react';
import { Alert, Pane } from 'evergreen-ui';

function renderError(error: string, description?: string): ReactElement {
  return (
    <Pane
      height={120}
      width={240}
      display="flex"
      alignItems="center"
      justifyContent="center"
      border="default"
    >
      <Alert intent="danger" title={error}>
        {description || null}
      </Alert>
    </Pane>
  );
}

interface Props {
  message: string;
  description?: string;
}

export function Error(props: Props) {
  return renderError(props.message, props.description);
}
