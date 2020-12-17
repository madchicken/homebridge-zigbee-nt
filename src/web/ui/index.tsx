import * as React from 'react';
import ReactDOM from 'react-dom';
import { Home } from './home';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Coordinator } from './coordinator';
import { Devices } from './devices';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NavBar } from './components/nav-bar';
import { Pane } from 'evergreen-ui';

const queryClient = new QueryClient();

function App() {
  return (
    <Pane display="flex" height="100%">
      <QueryClientProvider client={queryClient}>
        <Router>
          <NavBar />
          <Pane padding={16} flex="1">
            <Switch>
              <Route path="/devices/:ieeAddr?">
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
      </QueryClientProvider>
    </Pane>
  );
}

ReactDOM.render(<App />, document.getElementById('react-app'));
