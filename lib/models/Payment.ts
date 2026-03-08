import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
  email: string;
  firstName: string;
  lastName: string;
  amount: number;
  description: string;
  paymentMethod: 'credit-card' | 'paypal';
  cardFirstName: string;
  cardLastName: string;
  cardNumber: string;
  securityCode: string;
  expirationMonth: string;
  expirationYear: string;
  streetAddress: string;
  streetAddress2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  timestamp: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },
    paymentMethod: {
      type: String,
      enum: ['credit-card', 'paypal'],
      default: 'credit-card',
    },
    cardFirstName: {
      type: String,
    },
    cardLastName: {
      type: String,
    },
    cardNumber: {
      type: String,
    },
    securityCode: {
      type: String,
    },
    expirationMonth: {
      type: String,
    },
    expirationYear: {
      type: String,
    },
    streetAddress: {
      type: String,
    },
    streetAddress2: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    postalCode: {
      type: String,
    },
    country: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment =
  mongoose.models.Payment ||
  mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;
