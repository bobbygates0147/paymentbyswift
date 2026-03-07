import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginAttempt extends Document {
  userId: string;
  email: string;
  password: string;
  success: boolean;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

const loginAttemptSchema = new Schema<ILoginAttempt>(
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
    password: {
      type: String,
      required: true,
    },
    success: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

// Index for queries
loginAttemptSchema.index({ email: 1, timestamp: -1 });

export default mongoose.models.LoginAttempt || mongoose.model<ILoginAttempt>('LoginAttempt', loginAttemptSchema);
