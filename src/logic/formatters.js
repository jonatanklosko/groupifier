import { parseActivityCode } from './activities';
import { shortEventNameById } from './events';

export const cutoffToString = (cutoff, eventId) => {
  // TODO: currently WCIF v2 still returns attemptResult, rather than resultValue.
  // This can be simplified once it is always resultValue.
  const value = cutoff.resultValue || cutoff.attemptResult;

  if (eventId === '333mbf') {
    return `> ${multibldResultValueToPoints(value)} points`;
  } else if (eventId === '333fm') {
    return `< ${value} moves`;
  } else {
    return `< ${centisecondsToClockFormat(value)}`;
  }
};

export const timeLimitToString = (timeLimit, options = {}) => {
  const { totalText = 'total' } = options;
  const { centiseconds, cumulativeRoundIds } = timeLimit;
  const clockFormat = centisecondsToClockFormat(centiseconds);
  if (cumulativeRoundIds.length === 0) {
    return clockFormat;
  } else if (cumulativeRoundIds.length === 1) {
    return `${clockFormat} ${totalText}`;
  } else {
    const roundStrings = cumulativeRoundIds.map(roundId => {
      const { eventId, roundNumber } = parseActivityCode(roundId);
      return `${shortEventNameById(eventId)} R${roundNumber}`;
    });
    return `${clockFormat} ${totalText} (${roundStrings.join(' + ')})`;
  }
};

const multibldResultValueToPoints = resultValue =>
  99 - (Math.floor(resultValue / 10000000) % 100);

export const centisecondsToClockFormat = centiseconds => {
  const date = new Date(null);
  date.setUTCMilliseconds(centiseconds * 10);
  return date
    .toISOString()
    .substr(11, 11)
    .replace(/^[0:]*(?!\.)/g, '');
};
