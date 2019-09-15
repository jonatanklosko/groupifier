import pdfMake from './pdfmake';
import { flatMap, sortBy, chunk, times, sum, uniq } from '../utils';
import {
  parseActivityCode,
  groupActivitiesByRound,
  hasDistributedAttempts,
} from '../activities';
import { eventNameById } from '../events';
import { cutoffToString, timeLimitToString } from '../formatters';
import {
  getExpectedCompetitorsByRound,
  competitorsForRound,
  hasAssignment,
} from '../competitors';
import { getExtensionData } from '../wcif-extensions';
import { pdfName, getImageDataUrl } from './pdf-utils';
import { sortedGroupActivitiesWithSize } from '../groups';

/* See: https://github.com/bpampuch/pdfmake/blob/3da11bd8148b190808b06f7bc27883102bf82917/src/standardPageSizes.js#L10 */
const pageWidth = 595.28;
const pageHeight = 841.89;
const scorecardMargin = 20;

const maxAttemptCountByFormat = { '1': 1, '2': 2, '3': 3, m: 3, a: 5 };

export const downloadScorecards = (wcif, rounds) => {
  const { scorecardsBackgroundUrl } = getExtensionData(
    'CompetitionConfig',
    wcif
  );
  getImageDataUrl(scorecardsBackgroundUrl).then(imageData => {
    const pdfDefinition = scorecardsPdfDefinition(
      scorecards(wcif, rounds),
      imageData
    );
    pdfMake.createPdf(pdfDefinition).download(`${wcif.id}-scorecards.pdf`);
  });
};

export const downloadBlankScorecards = wcif => {
  const { scorecardsBackgroundUrl } = getExtensionData(
    'CompetitionConfig',
    wcif
  );
  getImageDataUrl(scorecardsBackgroundUrl).then(imageData => {
    const pdfDefinition = scorecardsPdfDefinition(
      blankScorecards(wcif),
      imageData
    );
    pdfMake
      .createPdf(pdfDefinition)
      .download(`${wcif.id}-blank-scorecards.pdf`);
  });
};

const scorecardsPdfDefinition = (scorecardList, imageData) => ({
  background: [
    ...(imageData === null
      ? []
      : [
          /* Determined empirically to fit results table. */
          { x: 60, y: 170 },
          { x: 360, y: 170 },
          { x: 60, y: 590 },
          { x: 360, y: 590 },
        ].map(absolutePosition => ({ absolutePosition, image: imageData }))),
    {
      canvas: [
        cutLine({
          x1: scorecardMargin,
          y1: pageHeight / 2,
          x2: pageWidth - scorecardMargin,
          y2: pageHeight / 2,
        }),
        cutLine({
          x1: pageWidth / 2,
          y1: scorecardMargin,
          x2: pageWidth / 2,
          y2: pageHeight - scorecardMargin,
        }),
      ],
    },
  ],
  pageMargins: [scorecardMargin, scorecardMargin],
  content: {
    layout: {
      /* Outer margin is done using pageMargins, we use padding for the remaining inner margins. */
      paddingLeft: i => (i % 2 === 0 ? 0 : scorecardMargin),
      paddingRight: i => (i % 2 === 0 ? scorecardMargin : 0),
      paddingTop: i => (i % 2 === 0 ? 0 : scorecardMargin),
      paddingBottom: i => (i % 2 === 0 ? scorecardMargin : 0),
      /* Get rid of borders. */
      hLineWidth: () => 0,
      vLineWidth: () => 0,
    },
    table: {
      widths: ['*', '*'],
      /* A4 page height minus vertical margins, divided into a half. */
      heights: (pageHeight - 4 * scorecardMargin) / 2,
      dontBreakRows: true,
      body: chunk(scorecardList, 2),
    },
  },
});

const cutLine = properties => ({
  ...properties,
  type: 'line',
  lineWidth: 0.1,
  dash: { length: 10 },
  lineColor: '#888888',
});

const scorecards = (wcif, rounds) => {
  const { localNamesFirst } = getExtensionData('CompetitionConfig', wcif);
  return flatMap(rounds, round => {
    const groupsWithCompetitors = groupActivitiesWithCompetitors(
      wcif,
      round.id
    );
    let scorecardNumber = sum(
      groupsWithCompetitors.map(([_, competitors]) => competitors.length)
    );
    return flatMap(groupsWithCompetitors, ([groupActivity, competitors]) => {
      const groupScorecards = competitors.map(competitor =>
        scorecard({
          scorecardNumber: scorecardNumber--,
          competitionName: wcif.shortName,
          activityCode: groupActivity.activityCode,
          round,
          attemptCount: maxAttemptCountByFormat[round.format],
          competitor,
          localNamesFirst,
        })
      );
      const scorecardsOnLastPage = groupScorecards.length % 4;
      return scorecardsOnLastPage === 0
        ? groupScorecards
        : groupScorecards.concat(times(4 - scorecardsOnLastPage, () => ({})));
    });
  });
};

const groupActivitiesWithCompetitors = (wcif, roundId) => {
  const sortedCompetitors = competitorsForRound(wcif, roundId);
  if (sortedCompetitors) {
    const sortedGroupActivities = hasDistributedAttempts(roundId)
      ? groupActivitiesByRound(wcif, roundId).slice(0, 1)
      : sortBy(
          groupActivitiesByRound(wcif, roundId),
          ({ activityCode }) => parseActivityCode(activityCode).groupNumber
        );
    return sortedGroupActivities.map(groupActivity => [
      groupActivity,
      sortedCompetitors.filter(competitor =>
        hasAssignment(competitor, groupActivity.id, 'competitor')
      ),
    ]);
  } else {
    /* If competitors for this round are not known yet, generate nameless scorecards. */
    const expectedCompetitorCount = getExpectedCompetitorsByRound(wcif)[roundId]
      .length;
    const groupsWithSize = hasDistributedAttempts(roundId)
      ? [[groupActivitiesByRound(wcif, roundId)[0], expectedCompetitorCount]]
      : sortedGroupActivitiesWithSize(wcif, roundId, expectedCompetitorCount);
    return groupsWithSize.map(([groupActivity, size]) => [
      groupActivity,
      times(size, () => ({ name: ' ', registrantId: ' ' })),
    ]);
  }
};

const blankScorecards = wcif => {
  const attemptCounts = flatMap(wcif.events, event => event.rounds).map(
    round => maxAttemptCountByFormat[round.format]
  );
  return flatMap(uniq(attemptCounts), attemptCount =>
    times(4, () => scorecard({ competitionName: wcif.name, attemptCount }))
  );
};

const scorecard = ({
  scorecardNumber,
  competitionName,
  activityCode,
  round,
  attemptCount = 5,
  competitor = { name: ' ', registrantId: ' ' },
  localNamesFirst = false,
}) => {
  const { eventId, roundNumber, groupNumber } = activityCode
    ? parseActivityCode(activityCode)
    : {};
  const { cutoff, timeLimit } = round || {};

  return [
    { text: scorecardNumber, fontSize: 10 },
    {
      text: competitionName,
      bold: true,
      fontSize: 15,
      margin: [0, 0, 0, 10],
      alignment: 'center',
    },
    {
      margin: [25, 0, 0, 0],
      table: {
        widths: ['*', 'auto', 'auto'],
        body: [
          columnLabels(['Event', 'Round', 'Group']),
          [
            eventId ? eventNameById(eventId) : ' ',
            { text: roundNumber, alignment: 'center' },
            { text: groupNumber, alignment: 'center' },
          ],
        ],
      },
    },
    {
      margin: [25, 0, 0, 0],
      table: {
        widths: [25, '*'],
        body: [
          columnLabels(['ID', 'Name']),
          [
            { text: competitor.registrantId, alignment: 'center' },
            {
              text: pdfName(competitor.name, {
                swapLatinWithLocalNames: localNamesFirst,
              }),
              maxHeight: 20 /* See: https://github.com/bpampuch/pdfmake/issues/264#issuecomment-108347567 */,
            },
          ],
        ],
      },
    },
    {
      margin: [0, 10, 0, 0],
      table: {
        widths: [
          16,
          25,
          '*',
          25,
          25,
        ] /* Note: 16 (width) + 4 + 4 (defult left and right padding) + 1 (left border) = 25 */,
        body: [
          columnLabels(['', 'Scr', 'Result', 'Judge', 'Comp'], {
            alignment: 'center',
          }),
          ...attemptRows(cutoff, attemptCount),
          [
            {
              text: 'Extra attempt',
              ...noBorder,
              colSpan: 5,
              margin: [0, 1],
              fontSize: 10,
            },
          ],
          attemptRow('_'),
          [{ text: '', ...noBorder, colSpan: 5, margin: [0, 1] }],
        ],
      },
    },
    {
      fontSize: 10,
      columns: [
        cutoff
          ? {
              text: `Cutoff: ${cutoffToString(cutoff, eventId)}`,
              alignment: 'center',
            }
          : {},
        timeLimit
          ? {
              text: `Time limit: ${timeLimitToString(timeLimit)}`,
              alignment: 'center',
            }
          : {},
      ],
    },
  ];
};

const columnLabels = (labels, style = {}) =>
  labels.map(label => ({
    ...style,
    ...noBorder,
    fontSize: 9,
    text: label,
  }));

const attemptRows = (cutoff, attemptCount) =>
  times(attemptCount, attemptIndex => attemptRow(attemptIndex + 1)).reduce(
    (rows, attemptRow, attemptIndex) =>
      attemptIndex + 1 === attemptCount
        ? [...rows, attemptRow]
        : [
            ...rows,
            attemptRow,
            attemptsSeparator(
              cutoff && attemptIndex + 1 === cutoff.numberOfAttempts
            ),
          ],
    []
  );

const attemptsSeparator = cutoffLine => [
  {
    ...noBorder,
    colSpan: 5,
    margin: [0, 1],
    columns: !cutoffLine
      ? []
      : [
          {
            canvas: [
              {
                type: 'line',
                x1: 0,
                y1: 0,
                x2: (pageWidth - 4 * scorecardMargin) / 2,
                y2: 0,
                dash: { length: 5 },
              },
            ],
          },
        ],
  },
];

const attemptRow = attemptNumber => [
  {
    text: attemptNumber,
    ...noBorder,
    fontSize: 20,
    bold: true,
    alignment: 'center',
  },
  {},
  {},
  {},
  {},
];

const noBorder = { border: [false, false, false, false] };
