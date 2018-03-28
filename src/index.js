import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './components/App/App';
import registerServiceWorker from './registerServiceWorker';
import Auth from './logic/Auth';

Auth.initialize();
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
