import { verifyUser } from 'auth';
import { Express } from 'express';

import managerRotues from './appManager';

/**
 * Create routes for app
 */
const init = (app: Express) => {
  app.use('/manager', verifyUser, managerRotues);
};

export { init };
