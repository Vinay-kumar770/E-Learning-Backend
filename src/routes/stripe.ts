import express from "express";
import { stripePayment, stripeCourse } from "../controllers/stripe";
import { authentication } from "../Authentication/is-auth";

const router = express.Router();

router.post("/stripe/payment", authentication, stripePayment);
router.get("/stripe/:courseId", authentication, stripeCourse);

export default router;
