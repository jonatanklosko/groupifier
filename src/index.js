import './polyfills';
import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './components/App/App';
import { unregister as unregisterServiceWorker } from './registerServiceWorker';
import { initializeAuth } from './logic/auth';

initializeAuth();
ReactDOM.render(<App />, document.getElementById('root'));
unregisterServiceWorker();
