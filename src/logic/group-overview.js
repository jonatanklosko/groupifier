import { flatMap, chunk, sortBy, zip } from './utils';
import { eventNameById } from './events';
import { activityById, activityCodeToName, hasDistributedAttempts, parseActivityCode, groupActivitiesByRound } from './activities';
import { acceptedPeople, hasAssignment } from './competitors';
import { getExtensionData } from './wcif-extensions';
import pdfMake from './pdfmake';
import { pdfName } from './pdf-utils';

export const downloadGroupOverview = (wcif, rounds) => {
  const pdfDefinition = groupOverviewPdfDefinition(wcif, rounds);
  pdfMake.createPdf(pdfDefinition).download(`${wcif.id}-group-overview.pdf`);
};

const groupOverviewPdfDefinition = (wcif, rounds) => ({
  content: flatMap(rounds, round => groupActivitiesByRound(wcif, round.id))
    .map(groupActivity => overviewForGroup(wcif, groupActivity))
});

const overviewForGroup = (wcif, groupActivity) => {
  const headersWithPeople = [
    ['Competitors', 'competitor'], ['Scramblers', 'staff-scrambler'], ['Runners', 'staff-runner', ], ['Judges', 'staff-judge']
  ].map(([header, assignmentCode]) => [
    header,
    wcif.persons.filter(person => hasAssignment(person, groupActivity.id, assignmentCode))
  ]).filter(([header, people]) => people.length > 0);
  return {
    unbreakable: true,
    margin: [0, 0, 0, 10],
    stack: [
      { text: activityCodeToName(groupActivity.activityCode), bold: true, fontSize: 14, margin: [0, 0, 0, 5] },
      {
        fontSize: 8,
        columns: headersWithPeople.map(([header, people]) => [
          { text: `${header} (${people.length})`, bold: true, fontSize: 10, margin: [0, 0, 0, 2] },
          { ul: people.map(person => pdfName(person.name, { short: true })).sort() }
        ])
      }
    ]
  };
};
