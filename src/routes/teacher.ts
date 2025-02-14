import express from "express";
import multer, { StorageEngine, FileFilterCallback } from "multer";
import { Request } from "express";
import {
  teacherHome,
  deleteCourse,
  editCourse,
  updateCourse,
  watchedByUsers,
  uploadCourse,
  uploadVideo,
} from "../controllers/teacher";
import { authentication } from "../Authentication/is-auth";

const router = express.Router();

// Image file storage configuration
const ImagefileStorage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

// Image file filter
const ImagefileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
    console.log("Wrong file type for image upload");
  }
};

// Video file storage configuration
const VideofileStorage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "videos");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  },
});

// Video file filter
const VideofileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (file.mimetype === "video/mp4") {
    cb(null, true);
  } else {
    cb(null, false);
    console.log("Wrong file type for video upload");
  }
};

const imageMulter = multer({
  storage: ImagefileStorage,
  fileFilter: ImagefileFilter,
}).single("image");
const videoMulter = multer({
  storage: VideofileStorage,
  fileFilter: VideofileFilter,
}).any();

router.post("/creator/create-course", imageMulter, uploadCourse);
router.post("/creator/videoUpload/:courseID", videoMulter, uploadVideo);
router.post("/creater/homepage", authentication, teacherHome);
router.post("/course/delete", authentication, deleteCourse);
router.post("/course/edit", authentication, editCourse);
router.put("/course/Update", imageMulter, updateCourse);
router.post("/watchedByuser", watchedByUsers);

export default router;
