import mongoose, { Schema, Document, ObjectId } from "mongoose";

// Define the User Interface
interface IUser extends Document {
  _id: ObjectId;
  name: string;
  email: string;
  password: string;
  skills?: string;
  isVerified: boolean;
  resetVerified?: boolean;
  courses: mongoose.Types.ObjectId[];
  preferences: string[];
  bookmarks: mongoose.Types.ObjectId[];
  interests: string[];
  goals: string[];
}

// Define the User Schema
const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures unique emails
    },
    password: {
      type: String,
      required: true,
    },
    skills: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      required: true,
    },
    resetVerified: {
      type: Boolean,
      required: false,
    },
    courses: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Course",
      },
    ],
    preferences: [
      {
        type: String,
      },
    ],
    bookmarks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    interests: [
      {
        type: String,
      },
    ],
    goals: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

// Export the User Model
export default mongoose.model<IUser>("User", userSchema);
