export interface LoginAttempt {
  id: string;
  userId: string;
  password: string;
  timestamp: string;
  date: string;
}

export interface OTPAttempt {
  id: string;
  userId: string;
  otpCode: string;
  timestamp: string;
  date: string;
  status: "correct" | "incorrect";
}
