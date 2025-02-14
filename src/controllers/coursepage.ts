import { Request, Response, NextFunction } from "express";
import Course from "../model/courses";
import User from "../model/user";
import PDFDocument from "pdfkit";
import fs from "fs";
import mongoose from "mongoose";
import path from "path";

export const CoursePage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }
    res.status(200).json({ course });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const Bookmark = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const userBookmarked = user.bookmarks.includes(
      new mongoose.Types.ObjectId(courseId)
    );
    const courseBookmarked = course.bookmark?.includes(
      new mongoose.Types.ObjectId(userId)
    );

    userBookmarked
      ? user.bookmarks.splice(
          user.bookmarks.indexOf(new mongoose.Types.ObjectId(courseId)),
          1
        )
      : user.bookmarks.push(new mongoose.Types.ObjectId(courseId));

    courseBookmarked
      ? course.bookmark?.splice(
          course.bookmark.indexOf(new mongoose.Types.ObjectId(userId)),
          1
        )
      : course.bookmark?.push(new mongoose.Types.ObjectId(userId));

    await user.save();
    await course.save();

    res.status(202).json({ message: "Successfully bookmarked/unbookmarked" });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const unbookmark = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, id: courseId } = req.body;

    if (!userId || !courseId) {
      res.status(400).json({ message: "User ID and Course ID are required" });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    // Remove course from user's bookmark list
    user.bookmarks = user.bookmarks.filter(
      (bookmark) => bookmark.toString() !== courseId
    );
    await user.save();

    // Remove user from course's bookmark list
    course.bookmark = course.bookmark?.filter(
      (bookmark) => bookmark.toString() !== userId
    );
    await course.save();

    res.status(200).json({ message: "Successfully unbookmarked" });
  } catch (error) {
    console.error("Error unbookmarking course:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const ShowBookmark = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate("Bookmark").exec();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ bookmarks: user.bookmarks });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const rating = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { courseId, rating } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    course.rating ??= { ratingSum: 0, timesUpdated: 0, ratingFinal: 0 };

    // Ensure ratingSum and timesUpdated are numbers
    course.rating.ratingSum = course.rating.ratingSum ?? 0;
    course.rating.timesUpdated = course.rating.timesUpdated ?? 0;

    // Update rating values
    course.rating.ratingSum += rating;
    course.rating.timesUpdated += 1;
    course.rating.ratingFinal =
      course.rating.ratingSum / course.rating.timesUpdated;

    await course.save();
    res.status(200).json({ course });
  } catch (err) {
    console.error(err);
    next(err);
  }
};

export const generatePDF = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseId;
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found" });
      return;
    }

    const pdfName = `course-${courseId}.pdf`;
    const pdfPath = path.join("Files", pdfName);
    const pdfDoc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename=\"${pdfName}\"`);
    pdfDoc.pipe(fs.createWriteStream(pdfPath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(20).text("Course Guide & Tips");
    pdfDoc
      .moveDown()
      .fontSize(18)
      .text("Creator: " + course.name);
    pdfDoc.moveDown().text("Description: " + course.description);
    pdfDoc.moveDown().text("Tips:");
    pdfDoc.text("1. Treat an online course like a real course.");
    pdfDoc.text("2. Hold yourself accountable.");
    pdfDoc.text("3. Practice time management.");
    pdfDoc.text("4. Stay organized.");
    pdfDoc.text("5. Eliminate distractions.");
    pdfDoc.end();
  } catch (err) {
    console.error(err);
    next(err);
  }
};
