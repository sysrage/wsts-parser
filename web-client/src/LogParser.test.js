import React from 'react';
import ReactDOM from 'react-dom';
import LogParser from './LogParser';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<LogParser />, div);
  ReactDOM.unmountComponentAtNode(div);
});
