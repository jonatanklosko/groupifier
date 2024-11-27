import { parseActivityCode } from './activities';
import { shortEventNameById } from './events';

export const cutoffToString = (cutoff, eventId) => {
  if (eventId === '333mbf') {
    return `> ${multibldAttemptResultToPoints(cutoff.attemptResult)} points`;
  } else if (eventId === '333fm') {
    return `< ${cutoff.attemptResult} moves`;
  } else {
    return `< ${centisecondsToClockFormat(cutoff.attemptResult)}`;
  }
};

export const timeLimitToString = (timeLimit, globalTranslation) => {
  const { centiseconds, cumulativeRoundIds } = timeLimit;
  const clockFormat = centisecondsToClockFormat(centiseconds);
  if (cumulativeRoundIds.length === 0) {
    return clockFormat;
  } else if (cumulativeRoundIds.length === 1) {
    return `${clockFormat} ${globalTranslation}`;
  } else {
    const roundStrings = cumulativeRoundIds.map(roundId => {
      const { eventId, roundNumber } = parseActivityCode(roundId);
      return `${shortEventNameById(eventId)} R${roundNumber}`;
    });
    return `${clockFormat} ${globalTranslation} (${roundStrings.join('+ ')})`;
  }
};

const multibldAttemptResultToPoints = attemptResult =>
  99 - (Math.floor(attemptResult / 10000000) % 100);

export const centisecondsToClockFormat = centiseconds => {
  const date = new Date(null);
  date.setUTCMilliseconds(centiseconds * 10);
  return date
    .toISOString()
    .substr(11, 11)
    .replace(/^[0:]*(?!\.)/g, '');
};
