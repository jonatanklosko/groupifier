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
import { getAssignment, hasAssignment } from '../assignments';
import { translation } from '../translations';

/* See: https://github.com/bpampuch/pdfmake/blob/3da11bd8148b190808b06f7bc27883102bf82917/src/standardPageSizes.js#L10 */
const scorecardPaperSizeInfos = {
  a4: {
    pageWidth: 595.28,
    pageHeight: 841.89,
    scorecardsPerRow: 2,
    scorecardsPerPage: 4,
    horizontalMargin: 15,
    verticalMargin: 15,
  },
  a6: {
    pageWidth: 297.64,
    pageHeight: 419.53,
    scorecardsPerRow: 1,
    scorecardsPerPage: 1,
    horizontalMargin: 15,
    verticalMargin: 15,
  },
  letter: {
    pageWidth: 612.0,
    pageHeight: 792.0,
    scorecardsPerRow: 2,
    scorecardsPerPage: 4,
    horizontalMargin: 15,
    verticalMargin: 10,
  },
};

const maxAttemptCountByFormat = { '1': 1, '2': 2, '3': 3, m: 3, a: 5 };

export const downloadScorecards = (
  wcif,
  rounds,
  rooms,
  language,
  language2,
  language3
) => {
  const { scorecardsBackgroundUrl, scorecardPaperSize } = getExtensionData(
    'CompetitionConfig',
    wcif
  );
  getImageDataUrl(scorecardsBackgroundUrl).then(imageData => {
    const pdfDefinition = scorecardsPdfDefinition(
      scorecards(wcif, rounds, rooms, language, language2, language3),
      imageData,
      scorecardPaperSize
    );
    pdfMake.createPdf(pdfDefinition).download(`${wcif.id}-scorecards.pdf`);
  });
};

export const downloadBlankScorecards = (
  wcif,
  language,
  language2,
  language3
) => {
  const { scorecardsBackgroundUrl, scorecardPaperSize } = getExtensionData(
    'CompetitionConfig',
    wcif
  );
  getImageDataUrl(scorecardsBackgroundUrl).then(imageData => {
    const pdfDefinition = scorecardsPdfDefinition(
      blankScorecards(wcif, language, language2, language3),
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
    horizontalMargin,
    verticalMargin,
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
              x1: horizontalMargin,
              y1: pageHeight / 2,
              x2: pageWidth - horizontalMargin,
              y2: pageHeight / 2,
            }),
            cutLine({
              x1: pageWidth / 2,
              y1: verticalMargin,
              x2: pageWidth / 2,
              y2: pageHeight - verticalMargin,
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
            width: 200,
            height: 200,
          }))),
      cutLines,
    ],
    pageSize: { width: pageWidth, height: pageHeight },
    pageMargins: [horizontalMargin, verticalMargin],
    content: {
      layout: {
        /* Outer margin is done using pageMargins, we use padding for the remaining inner margins. */
        paddingLeft: i => (i % scorecardsPerRow === 0 ? 0 : horizontalMargin),
        paddingRight: i =>
          i % scorecardsPerRow === scorecardsPerRow - 1 ? 0 : horizontalMargin,
        paddingTop: i => (i % scorecardsPerRow === 0 ? 0 : verticalMargin),
        paddingBottom: i =>
          i % scorecardsPerRow === scorecardsPerRow - 1 ? 0 : verticalMargin,
        /* Get rid of borders. */
        hLineWidth: () => 0,
        vLineWidth: () => 0,
      },
      table: {
        widths: Array(scorecardsPerRow).fill('*'),
        heights: pageHeight / scorecardsPerRow - 2 * verticalMargin,
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

const scorecards = (wcif, rounds, rooms, language, language2, language3) => {
  const {
    localNamesFirst,
    printStations,
    scorecardPaperSize,
    scorecardOrder,
    printScorecardsCoverSheets,
  } = getExtensionData('CompetitionConfig', wcif);
  const { scorecardsPerPage } = scorecardPaperSizeInfos[scorecardPaperSize];
  let cards = flatMap(rounds, round => {
    const groupsWithCompetitors = groupActivitiesWithCompetitors(
      wcif,
      round.id
    ).filter(([groupActivity, _]) =>
      rooms.includes(roomByActivity(wcif, groupActivity.id))
    );
    let scorecardNumber = sum(
      groupsWithCompetitors.map(
        ([_, competitorsWithStation]) => competitorsWithStation.length
      )
    );
    return flatMap(
      groupsWithCompetitors,
      ([groupActivity, competitorsWithStation]) => {
        const { featuredCompetitorWcaUserIds = [] } =
          getExtensionData('ActivityConfig', groupActivity) || {};
        let scorecardInGroupNumber = competitorsWithStation.length;
        const groupCoverSheet = printScorecardsCoverSheets
          ? coverSheet({
              competitionName: wcif.shortName,
              activityCode: groupActivity.activityCode,
              numberOfScorecards: competitorsWithStation.length,
              room: roomByActivity(wcif, groupActivity.id),
            })
          : null;
        const groupScorecards = competitorsWithStation.map(
          ([competitor, stationNumber]) =>
            scorecard({
              scorecardNumber: scorecardNumber--,
              // If station numbers are assigned use those, otherwise generate on the fly
              stationNumber: stationNumber || scorecardInGroupNumber--,
              competitionName: wcif.shortName,
              activityCode: groupActivity.activityCode,
              round,
              attemptCount: maxAttemptCountByFormat[round.format],
              competitor,
              localNamesFirst,
              printStations,
              scorecardPaperSize,
              featured: featuredCompetitorWcaUserIds.includes(
                competitor.wcaUserId
              ),
              language: language,
              language2: language2,
              language3: language3,
            })
        );
        if (groupCoverSheet) {
          groupScorecards.unshift(groupCoverSheet);
        }
        const scorecardsOnLastPage = groupScorecards.length % scorecardsPerPage;
        return scorecardsOnLastPage === 0 || scorecardOrder === 'stacked'
          ? groupScorecards
          : groupScorecards.concat(
              times(scorecardsPerPage - scorecardsOnLastPage, () => ({}))
            );
      }
    );
  });
  if (scorecardOrder === 'stacked') {
    const scorecardsOnLastPage = cards.length % scorecardsPerPage;
    if (scorecardsOnLastPage !== 0) {
      cards = cards.concat(
        times(scorecardsPerPage - scorecardsOnLastPage, () => ({}))
      );
    }
    cards = cards
      .map((card, idx) => {
        return { overallNumber: idx, card };
      })
      .sort((cardA, cardB) => {
        const sectionA =
          cardA.overallNumber % (cards.length / scorecardsPerPage);
        const sectionB =
          cardB.overallNumber % (cards.length / scorecardsPerPage);
        if (sectionA !== sectionB) {
          return sectionA - sectionB;
        }
        return cardA.overallNumber - cardB.overallNumber;
      })
      .map(card => card.card);
  }
  return cards;
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
      sortedCompetitors
        .filter(competitor =>
          hasAssignment(competitor, groupActivity.id, 'competitor')
        )
        .map(competitor => [
          competitor,
          getAssignment(competitor, groupActivity.id, 'competitor')
            .stationNumber,
        ]),
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
      times(size, () => [{ name: null, registrantId: null }, null]),
    ]);
  }
};

const blankScorecards = (wcif, language, language2, language3) => {
  const attemptCounts = flatMap(wcif.events, event => event.rounds).map(
    round => maxAttemptCountByFormat[round.format]
  );
  const { printStations, scorecardPaperSize } = getExtensionData(
    'CompetitionConfig',
    wcif
  );
  const { scorecardsPerPage } = scorecardPaperSizeInfos[scorecardPaperSize];
  return flatMap(uniq(attemptCounts), attemptCount =>
    times(scorecardsPerPage, () =>
      scorecard({
        competitionName: wcif.shortName,
        attemptCount,
        printStations,
        scorecardPaperSize,
        language: language,
        language2: language2,
        language3: language3,
      })
    )
  );
};

const scorecard = ({
  scorecardNumber,
  stationNumber,
  competitionName,
  activityCode,
  round,
  language = 'en',
  language2 = '',
  language3 = '',
  attemptCount = 5,
  competitor = { name: null, registrantId: null, wcaId: null },
  localNamesFirst = false,
  printStations,
  scorecardPaperSize,
  featured = false,
}) => {
  const defaultTranslation = translation('en');
  const translationData = translation(language) || defaultTranslation;
  const translationData2 =
    language2 !== language ? translation(language2) : null;
  const translationData3 =
    language3 !== language && language2 !== language3
      ? translation(language3)
      : null;

  // This handles all the translations (monolingual and multilingual)
  const t = (
    stringKey,
    mergeInOneLine = false,
    forcePrimaryLanguage = false
  ) => {
    if (forcePrimaryLanguage === 'short') {
      // Force return the short version of the first language translation
      return (
        translationData[stringKey + '_short'] ?? translationData[stringKey]
      );
    }

    const primaryString = translationData[stringKey];
    const primaryShort = translationData[stringKey + '_short'] ?? primaryString;

    // No secondary language or forced primary language (long version) then return primary language
    if (!translationData2 || forcePrimaryLanguage === 'long') {
      return primaryString;
    }

    // Sometimes we want the different languages in one line and sometimes in new lines
    const separator = mergeInOneLine ? ' | ' : '\n';
    // Build strings for secondary and tertiary translations. If we're in one-line mode and we have a short version then we take it.
    const secondaryString =
      mergeInOneLine && translationData2[stringKey + '_short']
        ? translationData2[stringKey + '_short']
        : translationData2[stringKey];
    const tertiaryString =
      mergeInOneLine && translationData3?.[stringKey + '_short']
        ? translationData3?.[stringKey + '_short']
        : translationData3?.[stringKey];

    let result = primaryShort;
    if (mergeInOneLine) {
      if (primaryShort !== secondaryString) {
        result += separator + secondaryString;
      }
      if (
        tertiaryString &&
        primaryShort !== tertiaryString &&
        secondaryString !== tertiaryString
      ) {
        result += separator + tertiaryString;
      }
    } else {
      result += separator + secondaryString;
      if (tertiaryString) {
        result += separator + tertiaryString;
      }
    }

    return result;
  };

  const { eventId, roundNumber, groupNumber } = activityCode
    ? parseActivityCode(activityCode)
    : {};
  const { cutoff, timeLimit } = round || {};
  const {
    pageWidth,
    scorecardsPerRow,
    horizontalMargin,
  } = scorecardPaperSizeInfos[scorecardPaperSize];
  const scorecardWidth = pageWidth / scorecardsPerRow - 2 * horizontalMargin;

  return [
    {
      fontSize: 10,
      columns: [
        {
          text: scorecardNumber && `${scorecardNumber}`,
          alignment: 'left',
        },
        featured
          ? {
              text: '★',
              font: 'WenQuanYiZenHei', // Roboto (default) does not support unicode icons like ★
              alignment: 'right',
            }
          : {},
      ],
    },
    {
      text: competitionName,
      bold: true,
      fontSize: 15,
      // If we have a string accross three lines (or two lines for US Letter) we need to gain some space by moving everything a bit up
      margin: [
        0,
        competitor.name &&
        ((scorecardPaperSize === 'letter' && language2) || language3)
          ? -15
          : 0,
        0,
        language3 ? 0 : language2 ? 5 : 10,
      ],
      alignment: 'center',
    },
    {
      margin: [25, 0, 0, 0],
      table: {
        // Make sure the width of round, group and station is at least 25 by preventing short texts to automatically shrink it
        widths: [
          '*',
          getWidthOfBoxOrAuto(t('round'), 25),
          getWidthOfBoxOrAuto(t('group'), 25),
          ...(printStations ? [getWidthOfBoxOrAuto(t('station'), 25)] : []),
        ],
        body: [
          columnLabels([
            t('eventLabel'),
            { text: t('round'), alignment: 'center' },
            { text: t('group'), alignment: 'center' },
            ...(printStations
              ? [{ text: t('station'), alignment: 'center' }]
              : []),
          ]),
          [
            eventId ? t('eventName')?.[eventId] || eventNameById(eventId) : ' ',
            { text: roundNumber, alignment: 'center' },
            { text: groupNumber, alignment: 'center' },
            ...(printStations
              ? [{ text: stationNumber, alignment: 'center' }]
              : []),
          ],
        ],
      },
    },
    {
      margin: [25, 0, 0, 0],
      table: {
        widths: [30, '*'],
        body: [
          columnLabels([
            'ID',
            [
              { text: t('name', true), alignment: 'left', width: 'auto' },
              {
                text:
                  competitor.wcaId ||
                  // If the competitor has a name, then this is a new competitor
                  // Else this is a blank scorecard
                  // If we have a string which is too long (in multi language mode most likely) then we use only the primary language
                  (competitor.name
                    ? t('name', true).length +
                        t('new_competitor', true).length <
                      47
                      ? t('new_competitor', true)
                      : t('new_competitor', true, 'long')
                    : ' '),
                alignment: 'right',
              },
            ],
          ]),
          [
            { text: competitor.registrantId || ' ', alignment: 'center' },
            {
              text: pdfName(competitor.name || ' ', {
                swapLatinWithLocalNames: localNamesFirst,
              }),
              maxHeight: 20 /* See: https://github.com/bpampuch/pdfmake/issues/264#issuecomment-108347567 */,
            },
          ],
        ],
      },
    },
    {
      margin: [0, language2 ? 5 : 10, 0, 0],
      table: {
        widths: [
          16,
          25,
          '*',
          25,
          25,
        ] /* Note: 16 (width) + 4 + 4 (defult left and right padding) + 1 (left border) = 25 */,
        body: [
          columnLabels(['', t('scr'), t('result'), t('judge'), t('comp')], {
            alignment: 'center',
            fontSize: 8,
          }),
          ...attemptRows(cutoff, attemptCount, scorecardWidth),
          [
            {
              /* There's a high chance the delegate_initials will be too long for 3 translations so we just use the primary language. Not the best solution though... */
              text:
                t('extra', true) +
                ' (' +
                (language3
                  ? t('delegate_initials', true, 'long')
                  : t('delegate_initials', true)) +
                ' _______)',
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
      text: cutoff
        ? `${t('cutoff', true)}: ${cutoffToString(cutoff, eventId)}`
        : '',
      fontSize: 10,
      alignment: 'center',
    },
    {
      text: timeLimit
        ? `${t('time_limit', true)}: ${timeLimitToString(
            timeLimit,
            t('global', true)
          )}`
        : ' ',
      fontSize: 10,
      alignment: 'center',
      margin: [0, 0, 0, -10],
    },
  ];
};

const coverSheet = ({
  competitionName,
  activityCode,
  numberOfScorecards,
  room,
}) => {
  const { eventId, roundNumber, groupNumber } = activityCode
    ? parseActivityCode(activityCode)
    : {};

  return [
    {
      text: competitionName,
      bold: true,
      fontSize: 15,
      margin: [0, 6],
      alignment: 'center',
    },
    {
      text: `${eventNameById(eventId)} Round ${roundNumber}`,
      fontSize: 15,
      margin: [0, 6],
      alignment: 'center',
    },
    {
      text: `Group ${groupNumber} (${room.name})`,
      fontSize: 15,
      margin: [0, 6],
      alignment: 'center',
    },
    {
      text: '-------------------- FOR DELEGATE --------------------',
      alignment: 'center',
      margin: [0, 6],
    },
    {
      text: [
        '1. Bundled all ',
        { text: numberOfScorecards, bold: true },
        ' scorecards ',
        { text: '□', font: 'WenQuanYiZenHei' },
      ],
      fontSize: 10,
      alignment: 'left',
      margin: [20, 6, 0, 6],
    },
    {
      text: [
        '2. Checked for missing signatures ',
        { text: '□', font: 'WenQuanYiZenHei' },
      ],
      fontSize: 10,
      font: 'WenQuanYiZenHei',
      alignment: 'left',
      margin: [20, 6, 0, 6],
    },
    {
      text: '3. Number of scorecards with incidents: ______',
      fontSize: 10,
      margin: [20, 6, 0, 6],
    },
    initialsField('Delegate'),
    {
      text: '-------------------- FOR DATA ENTRY --------------------',
      alignment: 'center',
      margin: [0, 6],
    },
    {
      text: '4. Results entered by Scoretaker',
      fontSize: 10,
      margin: [20, 6, 0, 6],
    },
    initialsField('Scoretaker'),
    {
      text: '5. Incidents logged by Delegate',
      fontSize: 10,
      margin: [20, 6, 0, 6],
    },
    initialsField('Delegate'),
    {
      text: '6. Results checked by Delegate',
      fontSize: 10,
      margin: [20, 6, 0, 6],
    },
    initialsField('Delegate'),
  ];
};

const initialsField = person => ({
  text: [{ text: `${person} initials`, bold: true }, ' ______'],
  alignment: 'center',
  fontSize: 10,
});

const columnLabels = (labels, style = {}) =>
  labels.map(label => ({
    ...style,
    ...noBorder,
    fontSize: 9,
    ...(Array.isArray(label) ? { columns: label } : { text: label }),
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

const getWidthOfBoxOrAuto = (translatedString, defaultWidth = 25) => {
  // We define here what is considered "too short" for a string
  const shortThreshold = 5;
  const checkNewLineBreak = translatedString.indexOf('\n');

  // Only line so we only need to check the length of the line and return the default width if it's too short
  if (checkNewLineBreak < 0) {
    if (translatedString.length < shortThreshold) {
      return defaultWidth;
    }
  }

  // Check the length of every line. If they are all too short we use the default width, else we let it adapt automatically
  const partsOfString = translatedString.split('\n');
  const hasLongString = partsOfString.some(
    part => part.length >= shortThreshold
  );
  return hasLongString ? 'auto' : defaultWidth;
};
