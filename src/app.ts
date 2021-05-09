import dotenv from 'dotenv';
import express, { ErrorRequestHandler } from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

dotenv.config();

// Service
import { init } from 'routes';

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // For serving static files

global.appRoot = path.resolve(__dirname);

// Routes
init(app);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  // @ts-ignore
  err.status = 404;
  next(err);
});

const globalErrorHandler: ErrorRequestHandler = (err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
};

// global error handler
app.use(globalErrorHandler);

export default app;
