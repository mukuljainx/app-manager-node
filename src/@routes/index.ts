import { Express } from 'express';

import appRotues from './app';

/**
 * Create routes for app
 */
const init = (app: Express) => {
  app.use('/app', appRotues);
};

export { init };
