import dotenv from "dotenv";

dotenv.config();

export const config = {
  sendgridKey: process.env.SENDGRID_KEY || "",
  mongoDatabase: process.env.MONGO_DATABASE || "",

  jwt: {
    accessToken: process.env.ACCESS_TOKEN_SECRET || "",
    refreshToken: process.env.REFRESH_TOKEN_SECRET || "",
    accessTokenLife: process.env.ACCESS_TOKEN_LIFE || "1h",
    refreshTokenLife: process.env.REFRESH_TOKEN_LIFE || "7d",
  },

  redis: {
    host: process.env.REDIS_HOST || "",
    password: process.env.REDIS_PASSWORD || "",
    port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  },

  googleAuth: process.env.OAuth2Client || "",

  stripe: {
    secretToken: process.env.STRIPE_SECRET_TOKEN || "",
  },
};
