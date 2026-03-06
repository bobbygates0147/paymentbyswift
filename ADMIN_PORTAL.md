# Admin Portal Setup Guide

## Overview
The admin portal allows administrators to view and manage user details for the PNC Bank application.

## Credentials
- **Email:** `admin@drema.com`
- **Password:** `19metameta`

These credentials are stored in `.env.local` and can be accessed by the authentication system.

## Features

### 1. Admin Login (`/admin/login`)
- Secure login page for admins
- Email and password validation
- Session management (1-hour session timeout)
- Show/hide password toggle

### 2. Admin Dashboard (`/admin/dashboard`)
- View all users in a table format
- Search functionality (by name, email, or user ID)
- Filter by account status (Active, Inactive, Pending)
- Quick view of user count
- Link to view detailed user information

### 3. User Details (`/admin/dashboard/user/[id]`)
- View complete user information
- Personal details (name, email, phone)
- Account information (type, status, last login)
- Address information (street, city, state, ZIP)
- Summary of the user's account

## File Structure
```
app/
├── admin/
│   ├── login/
│   │   └── page.tsx          # Admin login page
│   └── dashboard/
│       ├── page.tsx          # Admin dashboard with user list
│       └── user/
│           └── [id]/
│               └── page.tsx  # User detail page
├── utils/
│   └── auth.ts              # Authentication utilities
└── data/
    └── users.ts             # Dummy user data

.env.local                    # Admin credentials (email, password)
```

## How to Use

1. **Login as Admin:**
   - Navigate to `/admin/login`
   - Enter email: `admin@drema.com`
   - Enter password: `19metameta`
   - Click "Sign In"

2. **View All Users:**
   - Access the dashboard at `/admin/dashboard`
   - View all registered users in a table
   - Search and filter as needed

3. **View User Details:**
   - Click "View Details" on any user row
   - See complete user information
   - Click "Back to Dashboard" to return

4. **Logout:**
   - Click the "Logout" button in the top right
   - You will be redirected to the login page

## Security Features

- **Session Management:** Sessions expire after 1 hour of inactivity
- **Client-Side Validation:** Credentials are validated on the client
- **Protected Routes:** Dashboard and details pages require active session
- **Automatic Redirect:** Unauthenticated users are sent to login page

## Environment Variables

The admin credentials are defined in `.env.local`:
```
NEXT_PUBLIC_ADMIN_EMAIL=admin@drema.com
NEXT_PUBLIC_ADMIN_PASSWORD=19metameta
```

## Accessing the Admin Portal

From the customer login page (`/`), scroll down to find the "Access Admin Portal" link.

---

**Note:** For production deployment, consider:
- Using environment variables for credentials
- Implementing proper backend authentication
- Using JWT tokens instead of localStorage
- Adding password hashing and encryption
- Implementing role-based access control
