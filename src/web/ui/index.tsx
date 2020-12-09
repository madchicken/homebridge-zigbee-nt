import * as React from 'react';
import ReactDOM from 'react-dom';
import { Home } from './home';
import configureStore from './store';

ReactDOM.render(<Home store={configureStore({})} />, document.getElementById('react-app'));
