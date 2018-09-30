import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import LogParser from './LogParser';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<LogParser />, document.getElementById('root'));
registerServiceWorker();
