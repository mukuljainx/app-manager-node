import { PassportStatic } from 'passport';
import { Strategy } from 'passport-google-oauth20';
import express from 'express';
import * as db from 'db';

import { googleStategyConfig } from './config';

const router = express.Router();
let passport: PassportStatic;

const init = (passportCore: PassportStatic) => {
  passport = passportCore;
  passport.use(
    new Strategy(googleStategyConfig, async (_, __, profile, done) => {
      // controles goes back to app
      try {
        let user = await db.User.findOne({
          email: profile!.emails![0].value,
        }).lean();

        if (user) {
          return done(undefined, { ...user, id: user._id! });
        }
        const newUser = new db.User({
          name: profile.displayName,
          email: profile.emails![0].value,
          avatar:
            profile.photos && profile.photos.length > 0
              ? profile.photos[0].value
              : undefined,
          type: 'ADMIN',
          active: true,
        });
        user = await db.User.create(newUser);
        return done(undefined, { ...user, id: user._id! });
      } catch (error) {
        console.log(error);
        done(error);
      }
    }),
  );
  createRoutes();
};

const createRoutes = () => {
  router.get(
    '/',
    passport.authenticate('google', {
      scope: ['profile', 'email'],
    }),
  );
};

export { init, router as routes };
