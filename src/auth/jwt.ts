import express, { RequestHandler } from 'express';
import { PassportStatic } from 'passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { sign } from 'jsonwebtoken';
import { secretKey } from './config';

const router = express.Router();
let passport: PassportStatic;

const init = (passportCore: PassportStatic) => {
  passport = passportCore;

  passport.use(
    new Strategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: secretKey,
      },
      (jwtPayload, next) => {
        next(null, { id: jwtPayload.id, type: jwtPayload.type });
      },
    ),
  );
  createRoutes();
};

const authenticationMiddleware: RequestHandler = (req, res, next) => {
  passport.authenticate('jwt', { session: false })(req, res, next);
};

const createRoutes = () => {
  router.get(
    '/',
    passport.authenticate('google', { session: false }),
    (req, res) => {
      const user = req.user;
      if (!user) {
        return res.sendStatus(500).send({ error: 'user not found!' });
      }

      const token =
        'Bearer ' + sign({ id: user.id, type: user.type }, secretKey);

      res.status(200).send({
        token,
        ...user,
      });
    },
  );
};

export { init, router as routes, authenticationMiddleware };
