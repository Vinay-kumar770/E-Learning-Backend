import { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { validationResult } from "express-validator";
import User from "../model/user";
import Otp from "../model/otp";
import { config } from "../config/config";

const transporter = nodemailer.createTransport({
  host: "smtp.yourdomain.com", // Replace with your SMTP host
  port: 465, // 587 for TLS, 465 for SSL
  secure: true, // true for SSL, false for TLS
  auth: {
    user: "vinay", // Your SMTP username
    pass: "vinay", // Your SMTP password
  },
});

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, password, skills, interests, goals, name } = req.body;
  let otp: number;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(422).json({ message: errors.array() });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email,
      password: hashedPassword,
      isverified: false,
      name,
      skills,
      interests,
      goals,
      resetVerified: false,
    });
    await newUser.save();

    otp = Math.floor(100000 + Math.random() * 900000);
    const OTP = new Otp({ otp, email });
    await OTP.save();

    await transporter.sendMail({
      to: email,
      from: "palavalasavinaykumar.20.cse@anits.edu.in",
      subject: "OTP Verification",
      html: `<h1>Please Verify your account using this OTP:</h1><p>OTP: ${otp}</p>`,
    });

    res.status(201).json({ message: "OTP sent to your Email" });
  } catch (err) {
    next(err);
  }
};

export const update = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email, skills, interests, goals, name } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.skills = skills;
    user.interests = interests;
    user.goals = goals;
    user.name = name;

    await user.save();
    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    next(err);
  }
};

export const otpVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { otp, email } = req.body;

  try {
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || otpRecord.otp !== otp) {
      res.status(401).json({ message: "Invalid OTP" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.isVerified = true;
    await user.save();

    const access_token = jwt.sign(
      { email, userId: user._id },
      config.jwt.accessToken as string,
      {
        algorithm: "HS256",
        expiresIn: Number(config.jwt.accessTokenLife),
      }
    );

    const refresh_token = jwt.sign({ email }, config.jwt.refreshToken, {
      algorithm: "HS256",
      expiresIn: Number(config.jwt.refreshTokenLife),
    });

    res.status(200).json({
      message: "OTP verified successfully",
      access_token,
      refresh_token,
      userId: user._id.toString(),
      username: user.name,
    });
  } catch (err) {
    next(err);
  }
};

export const resendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { email } = req.body;
  try {
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord) {
      res.status(404).json({ message: "Email doesn't exist" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    otpRecord.otp = otp.toString();
    await otpRecord.save();

    await transporter.sendMail({
      to: email,
      from: "palavalasavinaykumar.20.cse@anits.edu.in",
      subject: "OTP Verification",
      html: `<h1>Please Verify your account using this OTP:</h1><p>OTP: ${otp}</p>`,
    });

    res.status(201).json({ message: "OTP resent successfully" });
  } catch (err) {
    next(err);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(422).json({ message: "User with this email doesn't exist" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true });

      await transporter.sendMail({
        to: email,
        from: "your-email@example.com",
        subject: "OTP Verification",
        html: `<h1>Please Verify your account using this OTP: </h1><p>OTP: ${otp}</p>`,
      });

      res.status(422).json({
        message: "You have not verified your OTP, a new OTP has been sent",
        redirect: true,
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ message: "Password doesn't match" });
      return;
    }

    const access_token = jwt.sign(
      { email, userId: user._id },
      config.jwt.accessToken as string,
      { algorithm: "HS256", expiresIn: Number(config.jwt.accessTokenLife) }
    );
    const refresh_token = jwt.sign({ email }, config.jwt.refreshToken, {
      algorithm: "HS256",
      expiresIn: Number(config.jwt.refreshTokenLife), // Convert string to number or use default value,
    });

    res.status(200).json({
      message: "User logged in!",
      access_token,
      refresh_token,
      username: user.name,
      userId: user._id,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User doesn't exist" });
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000);
    await Otp.findOneAndUpdate({ email }, { otp }, { upsert: true });

    await transporter.sendMail({
      to: email,
      from: "your-email@example.com",
      subject: "Reset Password",
      html: `<h1>This is your OTP to reset your password: ${otp}</h1>`,
    });

    res.status(200).json({ message: "OTP sent to reset password" });
  } catch (error) {
    next(error);
  }
};

export const resetOtpVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, otp } = req.body;
    const userOtp = await Otp.findOne({ email });

    if (!userOtp || userOtp.otp !== otp) {
      res.status(422).json({ message: "OTP is incorrect or expired" });
      return;
    }

    await User.findOneAndUpdate({ email }, { resetVerified: true });
    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
};

export const user = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const newPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User with this email doesn't exist" });
      return;
    }

    if (!user.resetVerified) {
      res.status(401).json({ message: "Please verify your email first" });
      return;
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetVerified = false;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
