import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/config";

interface AuthenticatedRequest extends Request {
  userID?: string;
}

export const authentication = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const accessToken = req.headers["authorization"];
  console.log(accessToken);

  if (!accessToken) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  const token = accessToken.split(" ")[1];

  try {
    const payload = jwt.verify(token, config.jwt.accessToken) as jwt.JwtPayload;

    if (!payload) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    req.userID = payload["username"];
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    res.status(401).json({ message: "Invalid token" });
    return;
  }
};

export const GetNewAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const refreshToken = req.body.refresh_token;

  if (!refreshToken) {
    res.status(401).json({ message: "Not authenticated" });
    return;
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      config.jwt.refreshToken
    ) as jwt.JwtPayload;

    if (!decoded || typeof decoded !== "object" || !decoded.email) {
      res.status(401).json({ message: "Invalid refresh token" });
      return;
    }

    const access_token = jwt.sign(
      { email: decoded.email },
      config.jwt.accessToken,
      {
        expiresIn: Number(config.jwt.accessTokenLife) || "1h", // Convert string to number or use default
        algorithm: "HS256",
      }
    );

    const new_refresh_token = jwt.sign(
      { email: decoded.email },
      config.jwt.refreshToken,
      {
        expiresIn: Number(config.jwt.refreshTokenLife) || "7d", // Convert string to number or use default
        algorithm: "HS256",
      }
    );

    res.status(200).json({
      message: "Fetched token successfully",
      access_token,
      refresh_token: new_refresh_token,
    });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};
