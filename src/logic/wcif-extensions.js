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

export const getExtensionData = (extensionName, wcifEntity) => {
  const extension = extensions(wcifEntity)
    .find(extension => extension.id === groupifierExtensionId(extensionName));
  return extension ? extension.data : null;
};
