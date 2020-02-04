import React, { Fragment, useMemo } from 'react';
import ListSubheader from '@material-ui/core/ListSubheader';
import { makeStyles } from '@material-ui/styles';

import DraggableCompetitor from '../DraggableCompetitor/DraggableCompetitor';

import {
  parseActivityCode,
  groupActivitiesByRound,
} from '../../../../../logic/activities';
import { partition } from '../../../../../logic/utils';
import { competitorsForRound } from '../../../../../logic/competitors';
import { COMPETITOR_ASSIGNMENT_CODE } from '../../../../../logic/assignments';

const useStyles = makeStyles(theme => ({
  withGroup: {
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
  const [withGroup, withoutGroup] = useMemo(() => {
    const groupActivityIds = groupActivitiesByRound(wcif, roundId).map(
      activity => activity.id
    );
    const competitors = competitorsForRound(wcif, roundId) || [];
    return partition(competitors, competitor =>
      competitor.assignments.some(
        assignment =>
          assignment.assignmentCode === COMPETITOR_ASSIGNMENT_CODE &&
          groupActivityIds.includes(assignment.activityId)
      )
    );
  }, [wcif, roundId]);

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
        className={classes.withGroup}
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
    </Fragment>
  );
});

export default AllDraggableCompetitors;
