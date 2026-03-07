# MongoDB Setup for PNC Bank Admin Portal

This document provides instructions for setting up MongoDB for the PNC Bank Admin Portal project.

## Prerequisites

- Node.js 16+ (already installed)
- MongoDB 4.0+ or MongoDB Atlas account
- npm (already installed)

## Installation Options

### Option 1: Local MongoDB

#### Windows Installation

1. **Download MongoDB Community Edition**
   - Visit: https://www.mongodb.com/try/download/community
   - Download the Windows MSI installer

2. **Install MongoDB**
   - Run the installer
   - Choose "Install MongoDB as a Service" (recommended)
   - Installation will complete automatically

3. **Verify Installation**
   ```powershell
   mongod --version
   ```

4. **Start MongoDB Service**
   ```powershell
   net start MongoDB
   ```

5. **Stop MongoDB Service**
   ```powershell
   net stop MongoDB
   ```

### Option 2: MongoDB Atlas (Cloud)

1. **Create Account**
   - Visit: https://www.mongodb.com/cloud/atlas
   - Sign up for a free account

2. **Create Cluster**
   - Click "Create a Database"
   - Choose "Starter" (free tier)
   - Select a region close to you
   - Wait for cluster creation (5-10 minutes)

3. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Enter username and password
   - Click "Add User"

4. **Get Connection String**
   - Go to "Clusters" → Click "Connect"
   - Select "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

5. **Update `.env.local`**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pnc-bank?retryWrites=true&w=majority
   ```

## Environment Configuration

### `.env.local` File

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/pnc-bank

# Or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pnc-bank?retryWrites=true&w=majority

# Admin credentials
NEXT_PUBLIC_ADMIN_EMAIL=admin@drema.com
NEXT_PUBLIC_ADMIN_PASSWORD=19metameta

# Node environment
NODE_ENV=development
```

## Database Initialization

The first time you start the application, it will automatically connect to MongoDB. To create the initial admin user:

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Initialize admin user via API**
   - Make a POST request to `/api/auth/register`:
   ```bash
   curl -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "admin@drema.com",
       "password": "19metameta"
     }'
   ```

   OR

   - Use Postman:
     - Method: POST
     - URL: `http://localhost:3000/api/auth/register`
     - Body (JSON):
     ```json
     {
       "email": "admin@drema.com",
       "password": "19metameta"
     }
     ```

## Database Models

### User Model
Stores user credentials with encrypted passwords:
- `email` (String, required, unique)
- `password` (String, required, hashed)
- `role` (String: 'admin' | 'user')
- `isActive` (Boolean)
- `createdAt` (Date)
- `updatedAt` (Date)

### LoginAttempt Model
Tracks all login attempts:
- `email` (String)
- `password` (String) - stored as entered for audit
- `success` (Boolean)
- `timestamp` (Date)
- `ipAddress` (String)
- `userAgent` (String)

### OTPAttempt Model
Tracks OTP verification attempts:
- `email` (String)
- `otpCode` (String)
- `status` ('correct' | 'incorrect')
- `timestamp` (Date)
- `expiresAt` (Date) - auto-deletes after expiration

## API Endpoints

### Authentication

**Register User**
```
POST /api/auth/register
Body: { email: string, password: string }
```

**Login**
```
POST /api/auth/login
Body: { email: string, password: string }
```

### OTP Management

**Generate OTP**
```
POST /api/otp/generate
Body: { email: string }
Response: { success: boolean, otp?: string (dev only) }
```

**Verify OTP**
```
POST /api/otp/verify
Body: { email: string, otp: string }
```

### Logs & Attempts

**Get Login Attempts**
```
GET /api/login-attempts?email=email@example.com&limit=50&skip=0
```

**Get OTP Attempts**
```
GET /api/otp-attempts?email=email@example.com&limit=50&skip=0
```

## Troubleshooting

### Connection Issues

**"MongooseError: Cannot connect to MongoDB"**
- Verify MongoDB is running: `mongod --version`
- Check MONGODB_URI in `.env.local`
- Ensure MongoDB service is started

**"Authentication failed" (MongoDB Atlas)**
- Verify username and password in connection string
- Check IP whitelist in MongoDB Atlas (allow 0.0.0.0/0 for development)
- Ensure password is URL-encoded

**"ECONNREFUSED" error**
- MongoDB service is not running
- Start MongoDB:
  ```powershell
  net start MongoDB  # Windows
  brew services start mongodb-community  # macOS
  ```

### Data Issues

**Models not being created**
- Check MongoDB connection
- Verify collections are being created in MongoDB
- Clear `.next` folder and restart dev server

**OTP expires immediately**
- Check server time synchronization
- Verify MongoDB `expiresAt` index is created

## Development Tools

### MongoDB Compass (GUI)

Download and install MongoDB Compass from: https://www.mongodb.com/products/tools/compass

### MongoDB Shell

```powershell
mongosh

# List databases
show dbs

# Use database
use pnc-bank

# Show collections
show collections

# View documents
db.users.find()
db.loginattempts.find()
db.otpattempts.find()
```

### Testing with cURL

```bash
# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@drema.com","password":"19metameta"}'

# Generate OTP
curl -X POST http://localhost:3000/api/otp/generate \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@drema.com"}'

# Get login attempts
curl "http://localhost:3000/api/login-attempts?email=admin@drema.com"
```

## Performance Optimization

### Indexes
All models have proper indexing for common queries:
- User: email (unique)
- LoginAttempt: email, timestamp
- OTPAttempt: email, expiresAt

### Connection Pooling
Mongoose handles connection pooling automatically. Default pool size is 10 connections.

## Security Best Practices

1. **Never commit `.env.local`** - Use `.env.example` for reference
2. **Strong Passwords** - Enforce minimum 8 characters
3. **Password Hashing** - Using bcrypt with 10 salt rounds
4. **Rate Limiting** - Implement in production
5. **HTTPS Only** - Use in production
6. **OTP Expiration** - 10 minutes default (configurable)

## Next Steps

1. Start development server: `npm run dev`
2. Open http://localhost:3000
3. Register/login through the portal
4. View login attempts in admin dashboard
5. Set up email service for OTP delivery (optional)

## Support

For MongoDB documentation: https://docs.mongodb.com/
For Mongoose documentation: https://mongoosejs.com/
