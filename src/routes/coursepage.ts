import express from "express";
import {
  CoursePage,
  Bookmark,
  ShowBookmark,
  unbookmark,
  rating,
  generatePDF,
} from "../controllers/coursepage";
import { authentication } from "../Authentication/is-auth";

const router = express.Router();

router.get("/course/:courseName/:courseId", authentication, CoursePage);

router.post("/home/:courseId/:courseName", authentication, Bookmark);

router.get("/users/:userName/:userId", authentication, ShowBookmark);

router.post("/unbookmark", authentication, unbookmark);
router.put("/rating", authentication, rating);
router.get("/pdf/download/:courseId", generatePDF);

export default router;
