import React from 'react';
import { shallow, mount } from 'enzyme';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';
import LinearProgress from '@material-ui/core/LinearProgress';
import ListItemText from '@material-ui/core/ListItemText';

import CompetitionList from './CompetitionList';
import { getUpcomingManageableCompetitions } from '../../logic/wca-api';

jest.mock('../../logic/wca-api');

describe('CompetitionList', () => {
  it('renders linear progress until competitions are fetched', async () => {
    const competitions = Promise.resolve([]);
    getUpcomingManageableCompetitions.mockReturnValue(competitions);
    let wrapper;
    await act(async () => {
      wrapper = mount(<CompetitionList />);
    });
    expect(wrapper.contains(<LinearProgress />)).toEqual(true);
    act(() => {
      wrapper.update();
    });
    expect(wrapper.contains(<LinearProgress />)).toEqual(false);
  });

  it('renders appropriate message if there are no competitions', async () => {
    const competitions = Promise.resolve([]);
    getUpcomingManageableCompetitions.mockReturnValue(competitions);
    let wrapper;
    await act(async () => {
      wrapper = mount(<CompetitionList />);
    });
    act(() => {
      wrapper.update();
    });
    expect(
      wrapper.contains(
        <ListItemText primary="You have no upcoming competitions to manage." />
      )
    ).toEqual(true);
  });

  it('renders list of competitions if there are any', async () => {
    const competitions = Promise.resolve([
      { id: 'Example2018', name: 'Example 2018' },
    ]);
    getUpcomingManageableCompetitions.mockReturnValue(competitions);
    let wrapper;
    await act(async () => {
      wrapper = mount(
        <MemoryRouter>
          <CompetitionList />
        </MemoryRouter>
      );
    });
    act(() => {
      wrapper.update();
    });
    expect(wrapper.contains(<ListItemText primary="Example 2018" />)).toEqual(
      true
    );
  });
});
