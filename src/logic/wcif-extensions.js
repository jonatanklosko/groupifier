const groupifierExtensionId = extensionName => `groupifier.${extensionName}`;

const buildGroupifierExtension = (extensionName, data) => ({
  id: groupifierExtensionId(extensionName),
  specUrl: `https://groupifier.jonatanklosko.com/wcif-extensions/${extensionName}.json`,
  data,
});

export const setExtensionData = (extensionName, wcifEntity, data) => {
  const otherExtensions = wcifEntity.extensions.filter(
    extension => extension.id !== groupifierExtensionId(extensionName)
  );
  return {
    ...wcifEntity,
    extensions: [
      ...otherExtensions,
      buildGroupifierExtension(extensionName, data),
    ],
  };
};

const defaultExtensionData = {
  /* This always gets generated, so we keep it as null */
  ActivityConfig: null,
  RoomConfig: {
    stations: null,
  },
  CompetitionConfig: {
    localNamesFirst: false,
    printOneName: false,
    scorecardsBackgroundUrl: '',
    competitorsSortingRule: 'ranks',
    noTasksForNewcomers: false,
    tasksForOwnEventsOnly: false,
    noRunningForForeigners: false,
    scorecardPaperSize: 'a4',
    scorecardOrder: 'natural',
    printScorecardsCoverSheets: false,
    /* Deprecated, use printScrambleCheckerRule instead. Only read as a fallback for older configurations. */
    printScrambleCheckerForTopRankedCompetitors: false,
    /* One of 'none', 'manual' or 'top-ranked'. Defaults to null (not set) rather than 'none',
       so that older configurations fall back to printScrambleCheckerForTopRankedCompetitors. */
    printScrambleCheckerRule: null,
    printScrambleCheckerForFinalRounds: false,
    printScrambleCheckerForBlankScorecards: false,
    scrambleCheckerCompetitors: {},
  },
};

export const getExtensionData = (extensionName, wcifEntity) => {
  const extension = (wcifEntity.extensions || []).find(
    extension => extension.id === groupifierExtensionId(extensionName)
  );
  const defaultData = defaultExtensionData[extensionName];
  if (defaultData === null) return extension && extension.data;
  return extension ? { ...defaultData, ...extension.data } : defaultData;
};

export const getExternalExtensionData = (extensionId, wcifEntity) => {
  const extension = (wcifEntity.extensions || []).find(
    extension => extension.id === extensionId
  );
  return extension && extension.data;
};

export const removeExtensionData = (extensionName, wcifEntity) => ({
  ...wcifEntity,
  extensions: wcifEntity.extensions.filter(
    extension => extension.id !== groupifierExtensionId(extensionName)
  ),
});

/* Returns the scramble checker rule, preferring the new printScrambleCheckerRule field
   and falling back to the deprecated boolean printScrambleCheckerForTopRankedCompetitors. */
export const getScrambleCheckerRule = competitionConfig => {
  const {
    printScrambleCheckerRule,
    printScrambleCheckerForTopRankedCompetitors,
  } = competitionConfig;
  if (printScrambleCheckerRule) return printScrambleCheckerRule;
  return printScrambleCheckerForTopRankedCompetitors ? 'top-ranked' : 'none';
};
