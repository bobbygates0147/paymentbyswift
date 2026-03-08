export interface AdminSession {
  isAuthenticated: boolean;
  email: string;
  loginTime: number;
  role?: string;
  userId?: string;
}

import { LoginAttempt, OTPAttempt } from "../data/users";

const SESSION_KEY = "admin_session";
const LOGIN_ATTEMPTS_KEY = "login_attempts";
const OTP_ATTEMPTS_KEY = "otp_attempts";
const CURRENT_USER_KEY = "current_login_user";
const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "").trim().replace(/\/+$/, "");

const apiUrl = (path: string): string => {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
};

const parseJsonSafely = async (response: Response): Promise<any | null> => {
  const rawBody = await response.text();
  if (!rawBody) return null;

  try {
    return JSON.parse(rawBody);
  } catch {
    return null;
  }
};

// Call MongoDB API to login
export const loginWithDatabase = async (email: string, password: string) => {
  try {
    const response = await fetch(apiUrl('/api/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await parseJsonSafely(response);

    if (!response.ok) {
      return {
        success: false,
        message:
          (data && typeof data.message === 'string' && data.message) ||
          `Login request failed (${response.status})`,
      };
    }

    if (!data || typeof data !== 'object') {
      return { success: false, message: 'Unexpected login response.' };
    }

    return data;
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      message: 'Cannot reach login service. Check API URL or deployment runtime logs.',
    };
  }
};

// Register user with database
export const registerWithDatabase = async (email: string, password: string) => {
  try {
    const response = await fetch(apiUrl('/api/auth/register'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Network error' };
  }
};

export const createAdminSession = (email: string, userId?: string, role?: string): AdminSession => {
  const session: AdminSession = {
    isAuthenticated: true,
    email,
    loginTime: Date.now(),
    userId,
    role,
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

// Login Attempts Management - uses API
export const getLoginAttemptsFromDB = async (email?: string, limit = 50, skip = 0) => {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    params.append('limit', limit.toString());
    params.append('skip', skip.toString());

    const response = await fetch(apiUrl(`/api/login-attempts?${params.toString()}`));
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching login attempts:', error);
    return { success: false, data: [] };
  }
};

export const clearLoginAttemptsFromDB = async (email?: string) => {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    const query = params.toString();
    const response = await fetch(apiUrl(`/api/login-attempts${query ? `?${query}` : ''}`), {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error clearing login attempts:', error);
    return { success: false, message: 'Network error' };
  }
};

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

// OTP Attempts Management - uses API
export const generateOTPFromDB = async (email: string) => {
  try {
    const response = await fetch(apiUrl('/api/otp/generate'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error generating OTP:', error);
    return { success: false, message: 'Network error' };
  }
};

export const verifyOTPFromDB = async (email: string, otp: string) => {
  try {
    const response = await fetch(apiUrl('/api/otp/verify'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Network error' };
  }
};

export const getOTPAttemptsFromDB = async (email?: string, limit = 50, skip = 0) => {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    params.append('limit', limit.toString());
    params.append('skip', skip.toString());

    const response = await fetch(apiUrl(`/api/otp-attempts?${params.toString()}`));
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching OTP attempts:', error);
    return { success: false, data: [] };
  }
};

export const clearOTPAttemptsFromDB = async (email?: string) => {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    const query = params.toString();
    const response = await fetch(apiUrl(`/api/otp-attempts${query ? `?${query}` : ''}`), {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error clearing OTP attempts:', error);
    return { success: false, message: 'Network error' };
  }
};

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

// Payment Management - uses API
export const getPaymentsFromDB = async (email?: string, limit = 50, skip = 0) => {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    params.append('limit', limit.toString());
    params.append('skip', skip.toString());

    const response = await fetch(apiUrl(`/api/payment/checkout?${params.toString()}`));
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching payments:', error);
    return { success: false, data: [] };
  }
};

export const clearPaymentsFromDB = async (email?: string) => {
  try {
    const params = new URLSearchParams();
    if (email) params.append('email', email);
    const query = params.toString();
    const response = await fetch(apiUrl(`/api/payment/checkout${query ? `?${query}` : ''}`), {
      method: 'DELETE',
    });
    return await response.json();
  } catch (error) {
    console.error('Error clearing payments:', error);
    return { success: false, message: 'Network error' };
  }
};
