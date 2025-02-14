import express from "express";
import { body, check } from "express-validator";
import {
  signup,
  login,
  otpVerification,
  resetPassword,
  resetOtpVerification,
  newPassword,
  resendOtp,
  update,
  user,
} from "../controllers/auth";
import { googleLogin, googleSignUp } from "../controllers/googleAuth";
import { GetNewAccessToken } from "../Authentication/is-auth";
import User from "../model/user";

const router = express.Router();

router.post(
  "/signup",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error("Email already exists!");
        }
      }),

    check("password").trim().isLength({ min: 5 }),
    check("name").trim().notEmpty(),
  ],
  signup
);

router.post("/update", update);

router.post(
  "/login",
  [
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (!user) {
          throw new Error("No account with this email!");
        }
      }),
  ],
  login
);

router.post("/signup/otp", otpVerification);
router.post("/signup/resetOtp", resetPassword);
router.post("/signup/otp-resend", resendOtp);
router.post("/signup/checkOtp", resetOtpVerification);
router.post("/signup/reset-password", newPassword);
router.get("/user/:userId", user);

// Google authentication routes
router.post("/google_login", googleLogin);
router.post("/google_signup", googleSignUp);

// Fetch access token using refresh token
router.post("/auth/token", GetNewAccessToken);

export default router;
