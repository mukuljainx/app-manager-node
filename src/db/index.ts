import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

mongoose
  .connect(process.env.DATABASE_URL!)
  .then(() => {
    console.log('\n\n\n\n', 'MONGO');
    console.log('Connected');
    console.log('\n\n\n\n');
  })
  .catch((error) => {
    console.log('\n\n\n\n', 'MONGO');
    console.log(error);
    console.log('\n\n\n\n');
  });

export { User } from 'auth/user.model';
export { App } from 'appManager/app.model';
