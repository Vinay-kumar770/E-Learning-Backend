import { Request, Response, NextFunction } from "express";
import Course from "../model/courses";

// Type definition for upload course request body
interface UploadCourseRequest extends Request {
  body: {
    _id: string;
    title: string;
    category: string;
    name: string;
    willLearn: string[];
    description: string;
    descriptionLong: string;
    requirement: string[];
    price: number;
  };
}

// Upload a new course
export const uploadCourse = async (
  req: UploadCourseRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Image is required!" });
      return;
    }

    const imageUrl = req.file.path;
    const {
      _id: userId,
      title,
      category,
      name,
      willLearn,
      description,
      descriptionLong,
      requirement,
      price,
    } = req.body;

    if (!title || !category || !name || !price) {
      res.status(400).json({ message: "Missing required fields!" });
      return;
    }

    const course = new Course({
      title,
      category,
      imageurl: imageUrl,
      name,
      willLearn,
      discription: description,
      discriptionLong: descriptionLong,
      requirement,
      rating: 0,
      price,
      creator: userId,
    });

    const result = await course.save();
    res
      .status(201)
      .json({ message: "Course created successfully", newCourse: result });
  } catch (error) {
    console.error("Error uploading course:", error);
    next(error);
  }
};

// Upload course videos
export const uploadVideo = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.params.courseID;
    const videos = req.files as Express.Multer.File[];

    if (!videos || videos.length === 0) {
      res.status(400).json({ message: "No videos uploaded" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found!" });
      return;
    }

    const videoContent = videos.map((video) => ({
      videoUrl: video.path,
      usersWatched: [],
    }));

    course.videoContent = videoContent;
    await course.save();

    res.status(200).json({ message: "Successfully saved the video" });
  } catch (error) {
    console.error("Error uploading video:", error);
    next(error);
  }
};

// Mark video as watched by a user
export const watchedByUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { userId, videoId, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found!" });
      return;
    }

    const video = course.videoContent?.find(
      (video: any) => video._id?.toString() === videoId
    );
    if (!video) {
      res.status(404).json({ message: "Video not found!" });
      return;
    }

    if (!video.usersWatched?.includes(userId)) {
      video.usersWatched?.push(userId);
      await course.save();
    }

    res.status(200).json({ message: "Updated watched status" });
  } catch (error) {
    console.error("Error updating watched status:", error);
    next(error);
  }
};

// Fetch courses created by a specific teacher
export const teacherHome = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.body.userId;

    if (!userId) {
      res.status(400).json({ message: "User ID is required" });
      return;
    }

    const courses = await Course.find({ creator: userId });

    res.status(200).json({ data: courses });
  } catch (error) {
    console.error("Error fetching teacher's courses:", error);
    next(error);
  }
};

// Delete a course
export const deleteCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.body.courseId;

    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found!" });
      return;
    }

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("Error deleting course:", error);
    next(error);
  }
};

// Fetch course details for editing
export const editCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const courseId = req.body.courseId;
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

// Update an existing course
export const updateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "Image is required!" });
      return;
    }

    const {
      courseId,
      title,
      category,
      name,
      willLearn,
      description,
      descriptionLong,
      requirement,
      price,
    } = req.body;
    const imageUrl = req.file.path;

    if (!title || !category || !name || !price) {
      res.status(400).json({ message: "Missing required fields!" });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: "Course not found!" });
      return;
    }

    course.title = title;
    course.category = category;
    course.imageurl = imageUrl;
    course.name = name;
    course.willLearn = willLearn;
    course.description = description;
    course.descriptionLong = descriptionLong;
    course.requirement = requirement;
    course.price = price;

    await course.save();

    res.status(200).json({ message: "Course updated successfully", course });
  } catch (error) {
    console.error("Error updating course:", error);
    next(error);
  }
};
