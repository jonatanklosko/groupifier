import React from 'react';
import { mount } from 'enzyme';

import App from './App';

jest.mock('../../logic/Auth');

it('renders without crashing', () => {
  mount(<App />);
});
