import dotenv from 'dotenv';
dotenv.config();

const googleStategyConfig = {
  clientID: process.env.GOOGLE_WEB_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_WEB_CLIENT_SECRET!,
  callbackURL: process.env.GOOGLE_WEB_CLIENT_CALLBACK_URL!,
};

const secretKey = process.env.SECRET_KEY!;

export { googleStategyConfig, secretKey };
