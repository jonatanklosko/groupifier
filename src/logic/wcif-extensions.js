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
    printStations: false,
    scorecardPaperSize: 'a4',
    scorecardOrder: 'natural',
    printScorecardsCoverSheets: false,
    printScrambleCheckerForTopRankedCompetitors: false,
    printScrambleCheckerForFinalRounds: false,
    printScrambleCheckerForBlankScorecards: false,
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

export const removeExtensionData = (extensionName, wcifEntity) => ({
  ...wcifEntity,
  extensions: wcifEntity.extensions.filter(
    extension => extension.id !== groupifierExtensionId(extensionName)
  ),
});
