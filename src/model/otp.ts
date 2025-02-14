import mongoose, { Schema, Document } from "mongoose";

// Define the OTP Interface
interface IOtp extends Document {
  otp: string;
  email: string;
  createdAt: Date;
}

// Define the OTP Schema
const otpSchema = new Schema<IOtp>({
  otp: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 120, // 2 minutes (MongoDB TTL Index)
  },
});

// Export the OTP Model
export default mongoose.model<IOtp>("Otp", otpSchema);
