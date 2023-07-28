/* Customized history preserving `staging` query parameter on location change. */

import { createBrowserHistory } from 'history';
import { copyQueryParams } from './utils';

const preserveQueryParams = (history, location) => {
  location.search = copyQueryParams(history.location.search, location.search, [
    'staging',
    'wca_prod_host',
  ]);

  return location;
};

const createLocationObject = (path, state) => {
  return typeof path === 'string' ? { pathname: path, state } : path;
};

const history = createBrowserHistory();

const originalPush = history.push;
history.push = (path, state) => {
  return originalPush.apply(history, [
    preserveQueryParams(history, createLocationObject(path, state)),
  ]);
};

const originalReplace = history.replace;
history.replace = (path, state) => {
  return originalReplace.apply(history, [
    preserveQueryParams(history, createLocationObject(path, state)),
  ]);
};

export default history;
