const GROUPIFIER_EXTENSION_ID = 'groupifier';

const groupifierExtension = (entityId, data) => ({
  id: GROUPIFIER_EXTENSION_ID,
  specUrl: `${process.env.PUBLIC_URL}/wcif-extensions/${entityId}.json`,
  data
});

const extensions = wcifEntity => wcifEntity.extensions || [];

export const setGroupifierData = (entityId, wcifEntity, data) => {
  const otherExtensions = extensions(wcifEntity).filter(extension => extension.id !== GROUPIFIER_EXTENSION_ID);
  return { ...wcifEntity, extensions: [...otherExtensions, groupifierExtension(entityId, data)] }
};

export const getGroupifierData = wcifEntity => {
  const extension = extensions(wcifEntity).find(extension => extension.id === GROUPIFIER_EXTENSION_ID);
  return extension ? extension.data : null;
};
