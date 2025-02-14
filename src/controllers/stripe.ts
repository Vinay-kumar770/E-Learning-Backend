import { Request, Response, NextFunction } from "express";
import Stripe from "stripe";
import { config as api_key } from "../config/config";
import Course from "../model/courses";

const stripe = new Stripe(
  (api_key.stripe.secretToken as string) || "tyytgdrfghjklkjhgf",
  {
    apiVersion: "2025-01-27.acacia",
  }
);

export const stripeCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId: string = req.params.courseId;
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ message: "Course not found!" });
      return;
    }

    res.status(200).json({ course });
  } catch (error) {
    console.error("Error fetching course:", error);
    next(error);
  }
};

export const stripePayment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { amount, id } = req.body;

    if (!amount || !id) {
      res.status(400).json({ message: "Invalid payment details" });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "inr",
      description: "Coursera Clone - Payment Test",
      payment_method: id,
      confirm: true,
    });

    console.log("Payment successful:", paymentIntent);
    res.status(200).json({ message: "Payment successful", success: true });
  } catch (error: any) {
    console.error("Payment failed:", error);
    res.status(500).json({
      message: "Payment Failed",
      success: false,
      error: error.message,
    });
  }
};
