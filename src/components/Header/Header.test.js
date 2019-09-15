import React from 'react';
import { shallow } from 'enzyme';
import { Link } from 'react-router-dom';
import Button from '@material-ui/core/Button';

import Header from './Header';

describe('Header', () => {
  describe('given isSignedIn of false', () => {
    it('renders sign in button', () => {
      const wrapper = shallow(<Header isSignedIn={false} />);
      expect(wrapper.find(Button).contains('Sign in')).toEqual(true);
    });

    it('renders link to homepage', () => {
      const wrapper = shallow(<Header isSignedIn={false} />);
      expect(wrapper.find(Link).prop('to')).toEqual('/');
    });

    it('calls onSignIn once button is clicked', () => {
      const handleSignIn = jest.fn();
      const wrapper = shallow(
        <Header isSignedIn={false} onSignIn={handleSignIn} />
      );
      wrapper.find('[children="Sign in"]').simulate('click');
      expect(handleSignIn.mock.calls.length).toEqual(1);
    });
  });

  describe('given isSignedIn of true', () => {
    it('renders sign out button', () => {
      const wrapper = shallow(<Header isSignedIn={true} />);
      expect(wrapper.find(Button).contains('Sign out')).toEqual(true);
    });

    it('renders link to competitions list', () => {
      const wrapper = shallow(<Header isSignedIn={true} />);
      expect(wrapper.find(Link).prop('to')).toEqual('/competitions');
    });

    it('calls onSignOut once button is clicked', () => {
      const handleSignOut = jest.fn();
      const wrapper = shallow(
        <Header isSignedIn={true} onSignOut={handleSignOut} />
      );
      wrapper.find('[children="Sign out"]').simulate('click');
      expect(handleSignOut.mock.calls.length).toEqual(1);
    });
  });
});
