import pdfMake from './pdfmake';
import { flatMap, sortByArray } from '../utils';
import {
  activityCodeToName,
  activityDurationString,
  parseActivityCode,
  roomsWithTimezoneAndGroups,
} from '../activities';
import { hasAssignment } from '../competitors';
import { pdfName } from './pdf-utils';

export const downloadGroupOverview = (wcif, rounds) => {
  const pdfDefinition = groupOverviewPdfDefinition(wcif, rounds);
  pdfMake.createPdf(pdfDefinition).download(`${wcif.id}-group-overview.pdf`);
};

const groupOverviewPdfDefinition = (wcif, rounds) => ({
  footer: (currentPage, pageCount) => ({
    text: `${currentPage} of ${pageCount}`,
    alignment: 'center',
    fontSize: 10,
  }),
  content: sortByArray(
    flatMap(
      flatMap(rounds, round => roomsWithTimezoneAndGroups(wcif, round.id)),
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
  const headersWithPeople = [
    ['Competitors', 'competitor'],
    ['Scramblers', 'staff-scrambler'],
    ['Runners', 'staff-runner'],
    ['Judges', 'staff-judge'],
  ]
    .map(([header, assignmentCode]) => [
      header,
      wcif.persons.filter(person =>
        hasAssignment(person, groupActivity.id, assignmentCode)
      ),
    ])
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
            ul: people
              .map(person => pdfName(person.name, { short: true }))
              .sort(),
          },
        ]),
      },
    ],
  };
};
