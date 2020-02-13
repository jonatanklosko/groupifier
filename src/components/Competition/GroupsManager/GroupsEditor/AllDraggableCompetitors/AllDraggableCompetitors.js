import React, { Fragment, useMemo } from 'react';
import ListSubheader from '@material-ui/core/ListSubheader';
import { makeStyles } from '@material-ui/styles';

import DraggableCompetitor from '../DraggableCompetitor/DraggableCompetitor';

import {
  parseActivityCode,
  groupActivitiesByRound,
} from '../../../../../logic/activities';
import { partition, sortByArray } from '../../../../../logic/utils';
import {
  competitorsForRound,
  acceptedPeople,
  bestAverageAndSingle,
} from '../../../../../logic/competitors';
import { COMPETITOR_ASSIGNMENT_CODE } from '../../../../../logic/assignments';

const useStyles = makeStyles(theme => ({
  opacity: {
    opacity: 0.5,
  },
  listSubheader: {
    backgroundColor: 'inherit',
  },
}));

const searchPeople = (people, search) => {
  return people.filter(person =>
    search
      .toLowerCase()
      .split(/\s+/)
      .every(searchPart => person.name.toLowerCase().includes(searchPart))
  );
};

const AllDraggableCompetitors = React.memo(({ wcif, roundId, search }) => {
  const classes = useStyles();
  const { eventId } = parseActivityCode(roundId);
  const [withGroup, withoutGroup, otherPeople] = useMemo(() => {
    const groupActivityIds = groupActivitiesByRound(wcif, roundId).map(
      activity => activity.id
    );
    const competitors = competitorsForRound(wcif, roundId) || [];
    const [withGroup, withoutGroup] = partition(competitors, competitor =>
      competitor.assignments.some(
        assignment =>
          assignment.assignmentCode === COMPETITOR_ASSIGNMENT_CODE &&
          groupActivityIds.includes(assignment.activityId)
      )
    );
    const otherPeople = acceptedPeople(wcif).filter(
      person => !competitors.includes(person)
    );
    const sortedOtherPeople = sortByArray(otherPeople, person => [
      ...bestAverageAndSingle(person, eventId).map(result => -result),
      person.name,
    ]);
    return [withGroup, withoutGroup, sortedOtherPeople];
  }, [wcif, roundId, eventId]);

  const withoutGroupItems = searchPeople(withoutGroup, search).map(
    (person, index) => (
      <DraggableCompetitor
        key={person.wcaUserId}
        person={person}
        draggableId={`${person.registrantId}:${person.assignments.length}`}
        index={index}
        averageLabelEventId={eventId}
      />
    )
  );

  const withGroupItems = searchPeople(withGroup, search).map(
    (person, index) => (
      <DraggableCompetitor
        key={person.wcaUserId}
        person={person}
        draggableId={`${person.registrantId}:${person.assignments.length}`}
        index={withoutGroup.length + index}
        averageLabelEventId={eventId}
        className={classes.opacity}
      />
    )
  );

  const otherPeopleItems = searchPeople(otherPeople, search).map(
    (person, index) => (
      <DraggableCompetitor
        key={person.wcaUserId}
        person={person}
        draggableId={`${person.registrantId}:${person.assignments.length}`}
        index={withoutGroup.length + withGroup.length + index}
        averageLabelEventId={eventId}
        className={classes.opacity}
      />
    )
  );

  return (
    <Fragment>
      <ListSubheader className={classes.listSubheader}>
        Without group
      </ListSubheader>
      {withoutGroupItems}
      <ListSubheader className={classes.listSubheader}>
        With group
      </ListSubheader>
      {withGroupItems}
      <ListSubheader className={classes.listSubheader}>
        Other people
      </ListSubheader>
      {otherPeopleItems}
    </Fragment>
  );
});

export default AllDraggableCompetitors;
