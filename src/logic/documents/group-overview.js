import pdfMake from './pdfmake';
import { flatMap, sortBy, sortByArray } from '../utils';
import {
  activityCodeToName,
  activityDurationString,
  parseActivityCode,
  roomsWithTimezoneAndGroups,
  stageByActivity,
} from '../activities';
import { hasAssignment } from '../assignments';
import { pdfName } from './pdf-utils';
import { competitorsForRound } from '../competitors';

export const downloadGroupOverview = (wcif, rounds, rooms, stages) => {
  const pdfDefinition = groupOverviewPdfDefinition(wcif, rounds, rooms, stages);
  pdfMake.createPdf(pdfDefinition).download(`${wcif.id}-group-overview.pdf`);
};

const groupOverviewPdfDefinition = (wcif, rounds, rooms, stages) => ({
  footer: (currentPage, pageCount) => ({
    text: `${currentPage} of ${pageCount}`,
    alignment: 'center',
    fontSize: 10,
  }),
  content: sortByArray(
    flatMap(
      flatMap(rounds, round =>
        roomsWithTimezoneAndGroups(wcif, round.id)
          .map(([room, timezone, groupActivities]) => [
            room,
            timezone,
            groupActivities.filter(groupActivity => {
              const stage = stageByActivity(wcif, groupActivity.id);
              return stage ? stages.includes(stage) : rooms.includes(room);
            }),
          ])
          .filter(
            ([room, timezone, groupActivities]) => groupActivities.length > 0
          )
      ),
      ([room, timezone, groupActivities]) =>
        groupActivities.map(groupActivity => [room, timezone, groupActivity])
    ),
    ([room, timezone, { startTime, activityCode }]) => [
      startTime,
      parseActivityCode(activityCode).groupNumber,
    ]
  ).map(([room, timezone, groupActivity]) =>
    overviewForGroup(wcif, room, timezone, groupActivity)
  ),
});

const overviewForGroup = (wcif, room, timezone, groupActivity) => {
  const stage = stageByActivity(wcif, groupActivity.id);
  const headersWithPeople = [
    ['Competitors', 'competitor'],
    ['Scramblers', 'staff-scrambler'],
    ['Runners', 'staff-runner'],
    ['Judges', 'staff-judge'],
  ]
    .map(([header, assignmentCode]) => {
      const { eventId, roundNumber } = parseActivityCode(
        groupActivity.activityCode
      );
      const roundId = `${eventId}-r${roundNumber}`;
      // When listing competitors, sort by results, the same
      // way as we do with scorecards
      const sortedPersons =
        assignmentCode === 'competitor'
          ? (competitorsForRound(wcif, roundId) || []).reverse()
          : sortBy(wcif.persons, person => person.name);
      return [
        header,
        sortedPersons.filter(person =>
          hasAssignment(person, groupActivity.id, assignmentCode)
        ),
      ];
    })
    .filter(([header, people]) => people.length > 0);
  return {
    unbreakable: true,
    margin: [0, 0, 0, 10],
    stack: [
      {
        text: activityCodeToName(groupActivity.activityCode),
        bold: true,
        fontSize: 14,
      },
      {
        columns: [
          `Time: ${activityDurationString(groupActivity, timezone)}`,
          `Room: ${room.name}`,
          ...(stage ? [`Stage: ${stage.name}`] : []),
        ],
        margin: [0, 5, 0, 5],
      },
      {
        fontSize: 8,
        columns: headersWithPeople.map(([header, people]) => [
          {
            text: `${header} (${people.length})`,
            bold: true,
            fontSize: 10,
            margin: [0, 0, 0, 2],
          },
          {
            [header === 'Competitors' ? 'ol' : 'ul']: people.map(person =>
              pdfName(person.name, { short: true })
            ),
          },
        ]),
      },
    ],
  };
};
