import { cutoffToString, timeLimitToString } from '../formatters';

describe('cutoffToString', () => {
  test('returns poinst for MBLD', () => {
    const cutoff = { numberOfAttempts: 1, attemptResult: 910000000 };
    expect(cutoffToString(cutoff, '333mbf')).toEqual('8 points');
  });

  test('returns moves for FMC', () => {
    const cutoff = { numberOfAttempts: 1, attemptResult: 40 };
    expect(cutoffToString(cutoff, '333fm')).toEqual('40 moves');
  });

  test('returns clock format for ordinary events', () => {
    const cutoff = { numberOfAttempts: 2, attemptResult: 1.5 * 3600 * 100 };
    expect(cutoffToString(cutoff, '333')).toEqual('1:30:00.00');
  });

  test('strips leading zeros', () => {
    const cutoff = { numberOfAttempts: 2, attemptResult: 30 * 100 };
    expect(cutoffToString(cutoff, '333')).toEqual('30.00');
  });
});

describe('timeLimitToString', () => {
  test('returns just the time for non-cumulative limit', () => {
    const timeLimit = { centiseconds: 15 * 100, cumulativeRoundIds: [] };
    expect(timeLimitToString(timeLimit)).toEqual('15.00');
  });

  test('makes it clear that a limit is cumulative for all sovles', () => {
    const timeLimit = {
      centiseconds: 60 * 100,
      cumulativeRoundIds: ['333bf-r1'],
    };
    expect(timeLimitToString(timeLimit)).toEqual('1:00.00 in total');
  });

  test('includes list of short round names for multi-round cumulative limit', () => {
    const timeLimit = {
      centiseconds: 1.5 * 3600 * 100,
      cumulativeRoundIds: ['444bf-r1', '555bf-r1'],
    };
    expect(timeLimitToString(timeLimit)).toEqual(
      '1:30:00.00 total for 4BLD R1, 5BLD R1'
    );
  });
});
