import { verifyUser } from 'auth';
import { Express } from 'express';
import path from 'path';
import https from 'https';
import fs from 'fs';

import managerRotues from './appManager';
import { getItem } from 'bucket';

/**
 * Create routes for app
 */
const init = (app: Express) => {
  app.use('/api/manager', verifyUser, managerRotues);
  app.get('/', (req, res) => {
    res.sendFile(
      path.resolve(
        `${global.appRoot}/apps/fluent-calendar-1620846929652/9e463b68e1c40ea7e5914f17b60bf73d.jpg`,
      ),
    );
  });
  app.get('/2', (req, res, next) => {
    getItem('temple.jpg', res);
  });
};

export { init };
