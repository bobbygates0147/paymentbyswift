import mongoose, { Schema, Document } from 'mongoose';

export interface IOTPAttempt extends Document {
  userId: string;
  email: string;
  otpCode: string;
  status: 'correct' | 'incorrect';
  timestamp: Date;
  expiresAt: Date;
  isSystemGenerated: boolean;
  isUserEntered: boolean;
}

const otpAttemptSchema = new Schema<IOTPAttempt>(
  {
    userId: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    otpCode: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['correct', 'incorrect'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      index: true,
    },
    isSystemGenerated: {
      type: Boolean,
      default: false,
      index: true,
    },
    isUserEntered: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-delete expired OTP attempts
otpAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.OTPAttempt || mongoose.model<IOTPAttempt>('OTPAttempt', otpAttemptSchema);
