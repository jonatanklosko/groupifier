import { chunk, sortBy, times, zip } from '../utils';
import { eventNameById } from '../events';
import {
  activityById,
  hasDistributedAttempts,
  parseActivityCode,
} from '../activities';
import { acceptedPeople } from '../competitors';
import { getExtensionData } from '../wcif-extensions';
import pdfMake from './pdfmake';
import { pdfName } from './pdf-utils';

export const downloadCompetitorCards = (wcif, evenlySpaced = false) => {
  const pdfDefinition = evenlySpaced
    ? competitorCardsEvenlySpacedPdfDefinition(wcif)
    : competitorCardsPdfDefinition(wcif);
  pdfMake.createPdf(pdfDefinition).download(`${wcif.id}-competitor-cards.pdf`);
};

const competitorCardsPdfDefinition = wcif => ({
  pageMargins: [5, 5],
  content: chunk(competitorCards(wcif, 3), 3).map(cards => ({
    columns: cards,
    margin: [5, 5],
    columnGap: 10,
    fontSize: 8,
    unbreakable: true,
  })),
});

const competitorCardsEvenlySpacedPdfDefinition = wcif => {
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const cardsPerRow = 2;
  const horizontalMargin = 20;
  const verticalMargin = 20;

  return {
    pageSize: { width: pageWidth, height: pageHeight },
    pageMargins: [horizontalMargin, verticalMargin],
    content: {
      fontSize: 8,
      layout: {
        /* Outer margin is done using pageMargins, we use padding for the remaining inner margins. */
        paddingLeft: i => (i % cardsPerRow === 0 ? 0 : horizontalMargin),
        paddingRight: i =>
          i % cardsPerRow === cardsPerRow - 1 ? 0 : horizontalMargin,
        paddingTop: i => (i % cardsPerRow === 0 ? 0 : verticalMargin),
        paddingBottom: i =>
          i % cardsPerRow === cardsPerRow - 1 ? 0 : verticalMargin,
        /* Get rid of borders. */
        hLineWidth: () => 0,
        vLineWidth: () => 0,
      },
      table: {
        widths: Array(cardsPerRow).fill('*'),
        heights: pageHeight / cardsPerRow - 2 * verticalMargin,
        dontBreakRows: true,
        body: chunk(competitorCards(wcif, cardsPerRow), cardsPerRow),
      },
    },
  };
};

const competitorCards = (wcif, cardsPerRow) => {
  const cards = sortBy(
    acceptedPeople(wcif),
    person => person.name
  ).map(person => competitorCard(wcif, person));
  const cardsInLastRow = cards.length % cardsPerRow;
  return cardsInLastRow === 0
    ? cards
    : cards.concat(times(cardsPerRow - cardsInLastRow, () => ({})));
};

const competitorCard = (wcif, person) => {
  const events = wcif.events.filter(event => !hasDistributedAttempts(event.id));
  const { localNamesFirst } = getExtensionData('CompetitionConfig', wcif) || {
    localNamesFirst: false,
  };
  const tasks = sortBy(
    person.assignments
      .map(({ activityId, assignmentCode }) => {
        const activity = activityById(wcif, activityId);
        const { eventId, roundNumber, groupNumber } = parseActivityCode(
          activity.activityCode
        );
        return { assignmentCode, eventId, groupNumber, roundNumber };
      })
      .filter(({ roundNumber }) => roundNumber === 1),
    ({ groupNumber }) => groupNumber
  );
  const groupsText = (eventId, assignmentCode) => ({
    text: tasks
      .filter(
        task =>
          task.eventId === eventId && task.assignmentCode === assignmentCode
      )
      .map(task => task.groupNumber)
      .join(', '),
    alignment: 'center',
  });
  const [assignmentCodes = [], headers = []] = zip(
    ...[
      ['competitor', 'Comp'],
      ['staff-scrambler', 'Scr'],
      ['staff-runner', 'Run'],
      ['staff-judge', 'Judge'],
    ].filter(([assignmentCode]) =>
      tasks.some(task => task.assignmentCode === assignmentCode)
    )
  );
  return {
    stack: [
      {
        text: pdfName(person.name, {
          swapLatinWithLocalNames: localNamesFirst,
        }),
        fontSize: 10,
        maxHeight: 20 /* See: https://github.com/bpampuch/pdfmake/issues/264#issuecomment-108347567 */,
      },
      {
        columns: [
          `ID: ${person.registrantId}`,
          {
            text: person.wcaId ? `WCA ID: ${person.wcaId}` : {},
            alignment: 'right',
          },
        ],
      },
      {
        table: {
          widths: ['auto', ...headers.map(() => '*')],
          body: [
            [
              'Event',
              ...headers.map(header => ({ text: header, alignment: 'center' })),
            ],
            ...events.map(event => [
              eventNameById(event.id),
              ...assignmentCodes.map(assignmentCode =>
                groupsText(event.id, assignmentCode)
              ),
            ]),
          ],
        },
        layout: {
          paddingLeft: () => 2,
          paddingRight: () => 2,
          paddingTop: () => 1,
          paddingBottom: () => 1,
        },
      },
      ...times(Math.max(0, 12 - events.length), () => ({
        text: ' ',
      })) /* Add some empty space if there are few events. */,
    ],
  };
};
