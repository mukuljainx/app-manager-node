import { verifyUser } from 'auth';
import { Express } from 'express';

import appRotues from './app';
import managerRotues from './manager';

/**
 * Create routes for app
 */
const init = (app: Express) => {
  app.use('/app', appRotues);
  app.use('/manager', verifyUser, managerRotues);
};

export { init };
