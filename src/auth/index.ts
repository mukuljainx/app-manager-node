import passport from 'passport';
import { Express } from 'express';

import * as google from './google';
import * as jwt from './jwt';

google.init(passport);
jwt.init(passport);

const createRoutes = (app: Express) => {
  app.use('/auth/google', google.routes);
  // this is for web app, as google redirects to web app
  // so it can send the data to our server
  // and get back the token as result
  app.use('/api/auth/google/redirect', jwt.routes);
};

export const init = (app: Express) => {
  app.use(passport.initialize());
  createRoutes(app);
};

export const verifyUser = jwt.authenticationMiddleware;

export default init;
