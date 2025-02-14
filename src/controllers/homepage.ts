import { Request, Response, NextFunction } from "express";
import Course from "../model/courses";
import User from "../model/user";

// Fetch all courses
export const allCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const courses = await Course.find();
    console.log(courses);
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Fetch courses based on category
export const fetchCourses = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const category = req.params.course;
    const courses = await Course.find(category ? { category } : {});
    res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Error occurred" });
  }
};

// Fetch courses based on user preferences
export const preferenceCourses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = req.params.course;
    if (category !== "preferences") return next();

    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    let courseArray: any[] = [];

    for (const preference of user.preferences) {
      const courses = await Course.find({ category: preference });
      courseArray.push(...courses);
    }

    res.status(200).json({ courses: courseArray });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching preference courses" });
  }
};

// Store user preferences
export const getPreferences = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { interest, userId } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    user.preferences = interest;
    await user.save();

    res.status(200).json({ message: "Preferences added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error saving preferences" });
  }
};
