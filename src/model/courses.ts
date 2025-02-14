import mongoose, { Schema, Document } from "mongoose";

// Define the Course Interface
interface ICourse extends Document {
  title: string;
  category: string;
  imageurl?: string;
  name: string; // Author Name
  willLearn?: string;
  description: string;
  descriptionLong?: string;
  requirement?: string;
  price?: string;
  creator: mongoose.Types.ObjectId;
  bookmark?: mongoose.Types.ObjectId[];
  videoContent?: {
    videoUrl?: string;
    usersWatched?: mongoose.Types.ObjectId[];
  }[];
  rating?: {
    ratingSum?: number;
    timesUpdated?: number;
    ratingFinal?: number;
  };
}

// Define the Course Schema
const courseSchema = new Schema<ICourse>(
  {
    title: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    imageurl: {
      type: String,
      required: false,
    },
    name: {
      type: String,
      required: true,
    },
    willLearn: {
      type: String,
      required: false,
    },
    description: {
      type: String,
      required: true,
    },
    descriptionLong: {
      type: String,
      required: false,
    },
    requirement: {
      type: String,
      required: false,
    },
    price: {
      type: String,
      required: false,
    },
    creator: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    bookmark: [
      {
        type: Schema.Types.ObjectId,
        required: false,
        ref: "User",
      },
    ],
    videoContent: [
      {
        videoUrl: {
          type: String,
          required: false,
        },
        usersWatched: [
          {
            type: Schema.Types.ObjectId,
            required: false,
            ref: "User",
          },
        ],
      },
    ],
    rating: {
      ratingSum: {
        type: Number,
        required: false,
        default: 1,
      },
      timesUpdated: {
        type: Number,
        required: false,
        default: 1,
      },
      ratingFinal: {
        type: Number,
        required: false,
        default: 1,
      },
    },
  },
  { timestamps: true }
);

// Export the Course Model
export default mongoose.model<ICourse>("Course", courseSchema);
