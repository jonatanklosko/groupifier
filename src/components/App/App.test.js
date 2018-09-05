import React from 'react';
import { mount } from 'enzyme';

import App from './App';

jest.mock('../../logic/auth');

it('renders without crashing', () => {
  mount(<App />);
});
