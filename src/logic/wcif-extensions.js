const groupifierExtensionId = extensionName => `groupifier.${extensionName}`;

const buildGroupifierExtension = (extensionName, data) => ({
  id: groupifierExtensionId(extensionName),
  specUrl: `${process.env.PUBLIC_URL}/wcif-extensions/${extensionName}.json`,
  data
});

const extensions = wcifEntity => wcifEntity.extensions || [];

export const setExtensionData = (extensionName, wcifEntity, data) => {
  const otherExtensions = extensions(wcifEntity)
    .filter(extension => extension.id !== groupifierExtensionId(extensionName));
  return {
    ...wcifEntity,
    extensions: [...otherExtensions, buildGroupifierExtension(extensionName, data)]
  };
};

const defaultExtensionData = {
  ActivityConfig: null, /* This always gets generated, so it's fine for it to be null until then. */
  RoomConfig: {
    stations: null
  },
  CompetitionConfig: {
    localNamesFirst: false,
    scorecardsBackgroundUrl: null
  }
};

export const getExtensionData = (extensionName, wcifEntity) => {
  const extension = extensions(wcifEntity)
    .find(extension => extension.id === groupifierExtensionId(extensionName));
  return extension ? extension.data : defaultExtensionData[extensionName];
};

export const removeExtensionData = (extensionName, wcifEntity) => ({
  ...wcifEntity,
  extensions: extensions(wcifEntity).filter(extension =>
    extension.id !== groupifierExtensionId(extensionName)
  )
});
