import React, { ReactElement } from 'react';
import { Provider } from 'react-redux';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import DeviceTable from './components/device-table';
import { AppState } from './reducers';
import { Store } from 'redux';

interface Props {
  store: Store<AppState>;
}

const queryCache = new QueryCache();
export function Home(props: Props): ReactElement {
  return (
    <Provider store={props.store}>
      <ReactQueryCacheProvider queryCache={queryCache}>
        <DeviceTable />
      </ReactQueryCacheProvider>
    </Provider>
  );
}
