# Services Middleware

Utility functions for API interactions from client-side components.

## Auth Service

```typescript
import { loginWithDatabase, registerWithDatabase } from '@/app/utils/auth';

// Login user
const response = await loginWithDatabase(email, password);
if (response.success) {
  // Handle successful login
  createAdminSession(response.user.email, response.user.id, response.user.role);
}

// Register user
const response = await registerWithDatabase(email, password);
if (response.success) {
  // Handle successful registration
}
```

## OTP Service

```typescript
import { generateOTPFromDB, verifyOTPFromDB } from '@/app/utils/auth';

// Generate OTP
const response = await generateOTPFromDB(email);
if (response.success) {
  // OTP sent/generated
  if (process.env.NODE_ENV === 'development') {
    console.log('OTP:', response.otp);
  }
}

// Verify OTP
const response = await verifyOTPFromDB(email, otpCode);
if (response.success) {
  // OTP verified
}
```

## Login Attempts Service

```typescript
import { getLoginAttemptsFromDB } from '@/app/utils/auth';

// Get all login attempts for a user
const response = await getLoginAttemptsFromDB('user@example.com');
if (response.success) {
  console.log('Login attempts:', response.data);
  console.log('Pagination:', response.pagination);
}

// Get login attempts with pagination
const response = await getLoginAttemptsFromDB('user@example.com', 20, 0);
```

## OTP Attempts Service

```typescript
import { getOTPAttemptsFromDB } from '@/app/utils/auth';

// Get all OTP attempts for a user
const response = await getOTPAttemptsFromDB('user@example.com');
if (response.success) {
  console.log('OTP attempts:', response.data);
  console.log('Pagination:', response.pagination);
}
```

## Session Management

```typescript
import { 
  createAdminSession, 
  getAdminSession, 
  clearAdminSession,
  isAdminAuthenticated 
} from '@/app/utils/auth';

// Create session after login
const session = createAdminSession(email, userId, role);

// Get current session
const session = getAdminSession();
if (session) {
  console.log('User:', session.email);
  console.log('Expires:', new Date(session.loginTime + 3600000));
}

// Check if authenticated
if (isAdminAuthenticated()) {
  // User is authenticated
}

// Clear session
clearAdminSession();
```
