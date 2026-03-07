# Quick Start Guide - MongoDB Integration

## ✅ What's Been Set Up

1. **MongoDB Connection**
   - Mongoose ODM configured
   - Connection pooling enabled
   - Environment-based configuration

2. **Database Models**
   - `User` - User accounts with password hashing
   - `LoginAttempt` - All login attempts tracked
   - `OTPAttempt` - OTP generation and verification

3. **API Endpoints**
   - `POST /api/auth/login` - User login
   - `POST /api/auth/register` - User registration
   - `POST /api/otp/generate` - Generate OTP
   - `POST /api/otp/verify` - Verify OTP
   - `GET /api/login-attempts` - View login history
   - `GET /api/otp-attempts` - View OTP history

4. **Frontend Integration**
   - Updated auth utilities in `app/utils/auth.ts`
   - New API calling functions
   - Session management

## 🚀 Getting Started

### Step 1: Install MongoDB

**Option A: Local MongoDB (Windows)**
```powershell
# Download from: https://www.mongodb.com/try/download/community
# Run installer, then verify:
mongod --version

# Start MongoDB
net start MongoDB
```

**Option B: MongoDB Atlas (Cloud)**
- Visit: https://www.mongodb.com/cloud/atlas
- Create free cluster
- Get connection string
- Update `.env.local` with your URI

### Step 2: Update Environment Variables

`.env.local` is already configured for local MongoDB:
```env
MONGODB_URI=mongodb://localhost:27017/pnc-bank
```

For MongoDB Atlas, replace with your connection string.

### Step 3: Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:3000`

### Step 4: Create Admin User

**Via cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@drema.com",
    "password": "19metameta"
  }'
```

**Via Postman:**
- Method: POST
- URL: `http://localhost:3000/api/auth/register`
- Body (JSON):
```json
{
  "email": "admin@drema.com",
  "password": "19metameta"
}
```

## 📋 Testing Checklist

### 1. Database Connection
- [ ] Start MongoDB service
- [ ] Run `npm run dev`
- [ ] Check console for connection messages
- [ ] No "ECONNREFUSED" errors

### 2. User Registration
- [ ] POST to `/api/auth/register`
- [ ] Use new email (must be unique)
- [ ] Verify success response
- [ ] Check MongoDB for new user document

### 3. User Login
- [ ] POST to `/api/auth/login` with correct credentials
- [ ] Verify success response with user data
- [ ] Try with wrong password (should fail)
- [ ] Check `LoginAttempt` collection in MongoDB

### 4. OTP Flow
- [ ] POST to `/api/otp/generate` with email
- [ ] Check MongoDB for OTP record
- [ ] Copy OTP from console (dev mode)
- [ ] POST to `/api/otp/verify` with correct OTP
- [ ] Verify success response
- [ ] Try with wrong OTP (should fail)

### 5. Admin Dashboard
- [ ] Login with admin credentials
- [ ] Navigate to dashboard
- [ ] View login attempts
- [ ] View OTP attempts
- [ ] Verify data displays correctly

### 6. Session Management
- [ ] Login and check localStorage
- [ ] Session should have: email, loginTime, isAuthenticated
- [ ] Close browser and reopen
- [ ] Session persists if within 1 hour
- [ ] Logout clears session

## 🔍 MongoDB Management

### Using MongoDB Compass
1. Download from: https://www.mongodb.com/products/tools/compass
2. Connect to `mongodb://localhost:27017`
3. Browse `pnc-bank` database
4. View collections: Users, LoginAttempts, OTPAttempts

### Using MongoDB Shell
```bash
mongosh

# Connect to database
use pnc-bank

# View documents
db.users.find()
db.loginattempts.find()
db.otpattempts.find()

# Check indexes
db.users.getIndexes()

# Count documents
db.users.countDocuments()
```

## 📊 Project Structure

```
pnc-bank/
├── lib/
│   ├── mongodb.ts          # Connection setup
│   ├── initDb.ts           # Database initialization
│   └── models/
│       ├── User.ts         # User model
│       ├── LoginAttempt.ts # Login tracking
│       └── OTPAttempt.ts   # OTP tracking
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/      # Login endpoint
│   │   │   └── register/   # Register endpoint
│   │   ├── otp/
│   │   │   ├── generate/   # Generate OTP
│   │   │   └── verify/     # Verify OTP
│   │   ├── login-attempts/ # View attempts
│   │   └── otp-attempts/   # View OTP attempts
│   └── utils/
│       └── auth.ts         # Auth utilities
├── .env.local              # Environment config
├── MONGODB_SETUP.md        # Detailed setup guide
└── SERVICES.md             # API documentation
```

## ⚠️ Troubleshooting

**MongoDB Won't Connect**
- Verify MongoDB is running: `net start MongoDB`
- Check MONGODB_URI in .env.local
- Try connecting with mongosh

**Build Errors**
```bash
rm -r .next
npm run build
```

**Models Not Loading**
- Clear .next folder
- Restart dev server
- Check MongoDB connection

**OTP Expires Too Fast**
- Check server time synchronization
- Verify expiresAt field in database

## 📝 Next Steps

1. Implement email service for OTP delivery (SendGrid, AWS SES, etc.)
2. Add rate limiting to API endpoints
3. Set up proper error handling and logging
4. Configure CORS for production
5. Add two-factor authentication
6. Implement refresh tokens for sessions
7. Set up database backups
8. Configure MongoDB indexes for performance

For detailed information, see:
- [MONGODB_SETUP.md](./MONGODB_SETUP.md) - Complete setup guide
- [SERVICES.md](./SERVICES.md) - API service documentation
- [Mongoose Docs](https://mongoosejs.com/) - ORM documentation
