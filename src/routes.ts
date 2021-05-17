import { verifyUser } from 'auth';
import { Express } from 'express';
import path from 'path';

import managerRotues from './appManager';
import { getFile } from 'appManager/controller';

/**
 * Create routes for app
 */
const init = (app: Express) => {
  app.get('/api/manager/assests/:appName/:fileName', getFile);
  app.use('/api/manager', verifyUser, managerRotues);
};

export { init };
