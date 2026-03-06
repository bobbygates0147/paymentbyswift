export interface AdminSession {
  isAuthenticated: boolean;
  email: string;
  loginTime: number;
}

import { LoginAttempt, OTPAttempt } from "../data/users";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@drema.com";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "19metameta";
const SESSION_KEY = "admin_session";
const LOGIN_ATTEMPTS_KEY = "login_attempts";
const OTP_ATTEMPTS_KEY = "otp_attempts";
const CURRENT_USER_KEY = "current_login_user";
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds

export const validateAdminCredentials = (email: string, password: string): boolean => {
  return email === ADMIN_EMAIL && password === ADMIN_PASSWORD;
};

export const createAdminSession = (email: string): AdminSession => {
  const session: AdminSession = {
    isAuthenticated: true,
    email,
    loginTime: Date.now(),
  };
  
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
  
  return session;
};

export const getAdminSession = (): AdminSession | null => {
  if (typeof window === "undefined") return null;
  
  const sessionData = localStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;
  
  try {
    const session: AdminSession = JSON.parse(sessionData);
    
    // Check if session has expired
    if (Date.now() - session.loginTime > SESSION_TIMEOUT) {
      clearAdminSession();
      return null;
    }
    
    return session;
  } catch {
    return null;
  }
};

export const clearAdminSession = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
};

export const isAdminAuthenticated = (): boolean => {
  return getAdminSession()?.isAuthenticated ?? false;
};

// Login Attempts Management
export const saveLoginAttempt = (userId: string, password: string): LoginAttempt => {
  const now = new Date();
  const attempt: LoginAttempt = {
    id: Date.now().toString(),
    userId,
    password,
    timestamp: now.toLocaleTimeString(),
    date: now.toLocaleDateString(),
  };

  if (typeof window !== "undefined") {
    const existingAttempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
    const attempts: LoginAttempt[] = existingAttempts ? JSON.parse(existingAttempts) : [];
    attempts.unshift(attempt); // Add to beginning (newest first)
    localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
  }

  return attempt;
};

export const getLoginAttempts = (): LoginAttempt[] => {
  if (typeof window === "undefined") return [];

  const attemptData = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
  if (!attemptData) return [];

  try {
    return JSON.parse(attemptData);
  } catch {
    return [];
  }
};

export const clearLoginAttempts = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOGIN_ATTEMPTS_KEY);
  }
};

// OTP Attempts Management
export const saveOTPAttempt = (userId: string, otpCode: string, isCorrect: boolean): OTPAttempt => {
  const now = new Date();
  const attempt: OTPAttempt = {
    id: Date.now().toString(),
    userId,
    otpCode,
    timestamp: now.toLocaleTimeString(),
    date: now.toLocaleDateString(),
    status: isCorrect ? "correct" : "incorrect",
  };

  if (typeof window !== "undefined") {
    const existingAttempts = localStorage.getItem(OTP_ATTEMPTS_KEY);
    const attempts: OTPAttempt[] = existingAttempts ? JSON.parse(existingAttempts) : [];
    attempts.unshift(attempt); // Add to beginning (newest first)
    localStorage.setItem(OTP_ATTEMPTS_KEY, JSON.stringify(attempts));
  }

  return attempt;
};

export const getOTPAttempts = (): OTPAttempt[] => {
  if (typeof window === "undefined") return [];

  const attemptData = localStorage.getItem(OTP_ATTEMPTS_KEY);
  if (!attemptData) return [];

  try {
    return JSON.parse(attemptData);
  } catch {
    return [];
  }
};

export const clearOTPAttempts = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(OTP_ATTEMPTS_KEY);
  }
};

// Current Login User Management (for OTP tracking)
export const saveCurrentLoginUser = (userId: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CURRENT_USER_KEY, userId);
  }
};

export const getCurrentLoginUser = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_USER_KEY);
};

export const clearCurrentLoginUser = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};
