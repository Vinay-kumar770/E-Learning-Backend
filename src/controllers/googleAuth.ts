import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../model/user";
import { config as api_key } from "../config/config";

const client = new OAuth2Client(api_key.googleAuth);

export const googleSignUp = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tokenId } = req.body;
    const response = await client.verifyIdToken({
      idToken: tokenId,
      audience: api_key.googleAuth,
    });

    const { email, email_verified, name } = response.getPayload()!;

    if (!email_verified) {
      res.status(403).json({ message: "Login failed, user not verified" });
      return;
    }

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.floor(Math.random() * 100).toString();
      const hashedPassword = await bcrypt.hash(randomPassword, 12);

      user = new User({
        email,
        password: hashedPassword,
        isverified: true,
        name,
        resetVerified: false,
      });

      await user.save();
      res.status(201).json({ message: "User Account has been created!" });
      return;
    }

    res.status(200).json({
      message: "User already has an account",
      username: user.name,
      userId: user._id,
    });
    return;
  } catch (err) {
    console.error("Google SignUp Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const googleLogin = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { tokenId } = req.body;
    const response = await client.verifyIdToken({
      idToken: tokenId,
      audience: api_key.googleAuth,
    });

    const { email, email_verified, name } = response.getPayload()!;

    if (!email_verified) {
      res.status(403).json({ message: "Login failed, user not verified" });
      return;
    }

    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User's account doesn't exist!" });
      return;
    }

    const access_token = jwt.sign({ email }, api_key.jwt.accessToken, {
      algorithm: "HS256",
      expiresIn: Number(api_key.jwt.accessTokenLife),
    });

    const refresh_token = jwt.sign({ email }, api_key.jwt.refreshToken, {
      algorithm: "HS256",
      expiresIn: Number(api_key.jwt.refreshTokenLife),
    });

    res.status(200).json({
      message: "User logged in!",
      access_token,
      refresh_token,
      username: user.name,
      userId: user._id,
    });
    return;
  } catch (err) {
    console.error("Google Login Error:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
