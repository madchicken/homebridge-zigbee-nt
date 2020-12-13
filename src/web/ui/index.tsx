import * as React from 'react';
import ReactDOM from 'react-dom';
import { Home } from './home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Coordinator } from './coordinator';
import { Devices } from './devices';
import { QueryCache, ReactQueryCacheProvider } from 'react-query';
import { NavBar } from './components/nav-bar';
import { Pane } from 'evergreen-ui';

const queryCache = new QueryCache();

function App() {
  return (
    <Pane display="flex" height="100%">
      <ReactQueryCacheProvider queryCache={queryCache}>
        <Router>
          <NavBar />
          <Pane padding={16} flex="1">
            <Switch>
              <Route path="/devices">
                <Devices />
              </Route>
              <Route path="/coordinator">
                <Coordinator />
              </Route>
              <Route path="/">
                <Home />
              </Route>
            </Switch>
          </Pane>
        </Router>
      </ReactQueryCacheProvider>
    </Pane>
  );
}

ReactDOM.render(<App />, document.getElementById('react-app'));
