import pdfMake from './pdfmake';
import { flatMap, sortBy, chunk, times, sum, uniq } from '../utils';
import {
  parseActivityCode,
  groupActivitiesByRound,
  hasDistributedAttempts,
  roomByActivity,
} from '../activities';
import { eventNameById } from '../events';
import { cutoffToString, timeLimitToString } from '../formatters';
import {
  getExpectedCompetitorsByRound,
  competitorsForRound,
} from '../competitors';
import { getExtensionData } from '../wcif-extensions';
import { pdfName, getImageDataUrl } from './pdf-utils';
import { sortedGroupActivitiesWithSize } from '../groups';
import { hasAssignment } from '../assignments';

/* See: https://github.com/bpampuch/pdfmake/blob/3da11bd8148b190808b06f7bc27883102bf82917/src/standardPageSizes.js#L10 */
const scorecardPaperSizeInfos = {
  a4: {
    pageWidth: 595.28,
    pageHeight: 841.89,
    scorecardsPerRow: 2,
    scorecardsPerPage: 4,
  },
  a6: {
    pageWidth: 297.64,
    pageHeight: 419.53,
    scorecardsPerRow: 1,
    scorecardsPerPage: 1,
  },
};
const scorecardMargin = 20;

const maxAttemptCountByFormat = { '1': 1, '2': 2, '3': 3, m: 3, a: 5 };

export const downloadScorecards = (wcif, rounds, rooms) => {
  const { scorecardsBackgroundUrl, scorecardPaperSize } = getExtensionData(
    'CompetitionConfig',
    wcif
  );
  getImageDataUrl(scorecardsBackgroundUrl).then(imageData => {
    const pdfDefinition = scorecardsPdfDefinition(
      scorecards(wcif, rounds, rooms),
      imageData,
      scorecardPaperSize
    );
    pdfMake.createPdf(pdfDefinition).download(`${wcif.id}-scorecards.pdf`);
  });
};

export const downloadBlankScorecards = wcif => {
  const { scorecardsBackgroundUrl, scorecardPaperSize } = getExtensionData(
    'CompetitionConfig',
    wcif
  );
  getImageDataUrl(scorecardsBackgroundUrl).then(imageData => {
    const pdfDefinition = scorecardsPdfDefinition(
      blankScorecards(wcif),
      imageData,
      scorecardPaperSize
    );
    pdfMake
      .createPdf(pdfDefinition)
      .download(`${wcif.id}-blank-scorecards.pdf`);
  });
};

const scorecardsPdfDefinition = (
  scorecardList,
  imageData,
  scorecardPaperSize
) => {
  const {
    pageWidth,
    pageHeight,
    scorecardsPerRow,
    scorecardsPerPage,
  } = scorecardPaperSizeInfos[scorecardPaperSize];
  const imagePositions = [
    /* Determined empirically to fit results table. */
    { x: 60, y: 170 },
    { x: 360, y: 170 },
    { x: 60, y: 590 },
    { x: 360, y: 590 },
  ].slice(0, scorecardsPerPage);
  const cutLines =
    scorecardsPerPage === 4
      ? {
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
        }
      : {};

  return {
    background: [
      ...(imageData === null
        ? []
        : imagePositions.map(absolutePosition => ({
            absolutePosition,
            image: imageData,
          }))),
      cutLines,
    ],
    pageSize: { width: pageWidth, height: pageHeight },
    pageMargins: [scorecardMargin, scorecardMargin],
    content: {
      layout: {
        /* Outer margin is done using pageMargins, we use padding for the remaining inner margins. */
        paddingLeft: i => (i % scorecardsPerRow === 0 ? 0 : scorecardMargin),
        paddingRight: i =>
          i % scorecardsPerRow === scorecardsPerRow - 1 ? 0 : scorecardMargin,
        paddingTop: i => (i % scorecardsPerRow === 0 ? 0 : scorecardMargin),
        paddingBottom: i =>
          i % scorecardsPerRow === scorecardsPerRow - 1 ? 0 : scorecardMargin,
        /* Get rid of borders. */
        hLineWidth: () => 0,
        vLineWidth: () => 0,
      },
      table: {
        widths: Array(scorecardsPerRow).fill('*'),
        heights: pageHeight / scorecardsPerRow - 2 * scorecardMargin,
        dontBreakRows: true,
        body: chunk(scorecardList, scorecardsPerRow),
      },
    },
  };
};

const cutLine = properties => ({
  ...properties,
  type: 'line',
  lineWidth: 0.1,
  dash: { length: 10 },
  lineColor: '#888888',
});

const scorecards = (wcif, rounds, rooms) => {
  const {
    localNamesFirst,
    printStations,
    scorecardPaperSize,
  } = getExtensionData('CompetitionConfig', wcif);
  return flatMap(rounds, round => {
    const groupsWithCompetitors = groupActivitiesWithCompetitors(
      wcif,
      round.id
    ).filter(([groupActivity, _]) =>
      rooms.includes(roomByActivity(wcif, groupActivity.id))
    );
    let scorecardNumber = sum(
      groupsWithCompetitors.map(([_, competitors]) => competitors.length)
    );
    return flatMap(groupsWithCompetitors, ([groupActivity, competitors]) => {
      let scorecardInGroupNumber = competitors.length;
      const groupScorecards = competitors.map(competitor =>
        scorecard({
          scorecardNumber: scorecardNumber--,
          scorecardInGroupNumber: scorecardInGroupNumber--,
          competitionName: wcif.shortName,
          activityCode: groupActivity.activityCode,
          round,
          attemptCount: maxAttemptCountByFormat[round.format],
          competitor,
          localNamesFirst,
          printStations,
          scorecardPaperSize,
        })
      );
      const { scorecardsPerPage } = scorecardPaperSizeInfos[scorecardPaperSize];
      const scorecardsOnLastPage = groupScorecards.length % scorecardsPerPage;
      return scorecardsOnLastPage === 0
        ? groupScorecards
        : groupScorecards.concat(
            times(scorecardsPerPage - scorecardsOnLastPage, () => ({}))
          );
    });
  });
};

const groupActivitiesWithCompetitors = (wcif, roundId) => {
  const sortedCompetitors = competitorsForRound(wcif, roundId);
  if (sortedCompetitors) {
    const sortedGroupActivities = hasDistributedAttempts(roundId)
      ? groupActivitiesByRound(wcif, roundId)
          /* Don't duplicate scorecards for each attempt.  */
          .filter(
            ({ activityCode }) =>
              parseActivityCode(activityCode).attemptNumber === 1
          )
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
  const { scorecardPaperSize } = getExtensionData('CompetitionConfig', wcif);
  const { scorecardsPerPage } = scorecardPaperSizeInfos[scorecardPaperSize];
  return flatMap(uniq(attemptCounts), attemptCount =>
    times(scorecardsPerPage, () =>
      scorecard({
        competitionName: wcif.name,
        attemptCount,
        scorecardPaperSize,
      })
    )
  );
};

const scorecard = ({
  scorecardNumber,
  scorecardInGroupNumber,
  competitionName,
  activityCode,
  round,
  attemptCount = 5,
  competitor = { name: ' ', registrantId: ' ' },
  localNamesFirst = false,
  printStations,
  scorecardPaperSize,
}) => {
  const { eventId, roundNumber, groupNumber } = activityCode
    ? parseActivityCode(activityCode)
    : {};
  const { cutoff, timeLimit } = round || {};
  const { pageWidth, scorecardsPerRow } = scorecardPaperSizeInfos[
    scorecardPaperSize
  ];
  const scorecardWidth = pageWidth / scorecardsPerRow - 2 * scorecardMargin;

  return [
    {
      text: scorecardNumber && `${scorecardNumber}`,
      fontSize: 10,
    },
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
        widths: ['*', 'auto', 'auto', ...(printStations ? ['auto'] : [])],
        body: [
          columnLabels([
            'Event',
            'Round',
            'Group',
            ...(printStations ? ['Station'] : []),
          ]),
          [
            eventId ? eventNameById(eventId) : ' ',
            { text: roundNumber, alignment: 'center' },
            { text: groupNumber, alignment: 'center' },
            ...(printStations
              ? [{ text: scorecardInGroupNumber, alignment: 'center' }]
              : []),
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
          ...attemptRows(cutoff, attemptCount, scorecardWidth),
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

const attemptRows = (cutoff, attemptCount, scorecardWidth) =>
  times(attemptCount, attemptIndex => attemptRow(attemptIndex + 1)).reduce(
    (rows, attemptRow, attemptIndex) =>
      attemptIndex + 1 === attemptCount
        ? [...rows, attemptRow]
        : [
            ...rows,
            attemptRow,
            attemptsSeparator(
              cutoff && attemptIndex + 1 === cutoff.numberOfAttempts,
              scorecardWidth
            ),
          ],
    []
  );

const attemptsSeparator = (cutoffLine, scorecardWidth) => [
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
                x2: scorecardWidth,
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
