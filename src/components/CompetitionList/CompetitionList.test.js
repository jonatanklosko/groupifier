import React from 'react';
import { shallow } from 'enzyme';
import { LinearProgress } from 'material-ui/Progress';
import { ListItemText } from 'material-ui/List';

import CompetitionList from './CompetitionList';
import WcaApi from '../../logic/WcaApi';

jest.mock('../../logic/WcaApi');

describe('CompetitionList', () => {
  it('renders linear progress until competitions are fetched', () => {
    const competitions = Promise.resolve([]);
    WcaApi.getUpcomingManageableCompetitions.mockReturnValue(competitions);
    const wrapper = shallow(<CompetitionList />);
    expect(wrapper.contains(<LinearProgress />)).toEqual(true);
    return competitions.then(() => {
      wrapper.update();
      expect(wrapper.contains(<LinearProgress />)).toEqual(false);
    });
  });

  it('renders appropriate message if there are no competitions', () => {
    const competitions = Promise.resolve([]);
    WcaApi.getUpcomingManageableCompetitions.mockReturnValue(competitions);
    const wrapper = shallow(<CompetitionList />);
    return competitions.then(() => {
      wrapper.update();
      expect(
        wrapper.contains(<ListItemText primary="You have no upcoming competitions to manage." />)
      ).toEqual(true);
    });
  });

  it('renders list of competitions if there are any', () => {
    const competitions = Promise.resolve([{ id: 'Example2018', name: 'Example 2018' }]);
    WcaApi.getUpcomingManageableCompetitions.mockReturnValue(competitions);
    const wrapper = shallow(<CompetitionList />);
    return competitions.then(() => {
      wrapper.update();
      expect(wrapper.contains(<ListItemText primary="Example 2018" />)).toEqual(true);
    });
  });
});
