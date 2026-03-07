# MongoDB Setup Checklist

Complete this checklist to ensure MongoDB is properly configured:

## Prerequisites
- [ ] Node.js 16+ installed
- [ ] npm installed
- [ ] VS Code or code editor ready

## Installation

### MongoDB Installation
- [ ] Downloaded MongoDB Community Edition
- [ ] Installed MongoDB successfully
- [ ] MongoDB service is running (`net start MongoDB`)
- [ ] Verified installation: `mongod --version`

### Project Dependencies
- [ ] Ran `npm install`
- [ ] `mongoose` installed in package.json
- [ ] `bcryptjs` installed in package.json
- [ ] `dotenv` installed in package.json

## Configuration

### Environment Variables
- [ ] `.env.local` file exists
- [ ] `MONGODB_URI=mongodb://localhost:27017/pnc-bank` set
- [ ] `NEXT_PUBLIC_ADMIN_EMAIL=admin@drema.com` set
- [ ] `NEXT_PUBLIC_ADMIN_PASSWORD=19metameta` set
- [ ] `NODE_ENV=development` set

### Project Files
- [ ] `lib/mongodb.ts` created (connection)
- [ ] `lib/models/User.ts` created
- [ ] `lib/models/LoginAttempt.ts` created
- [ ] `lib/models/OTPAttempt.ts` created
- [ ] API routes created:
  - [ ] `app/api/auth/login/route.ts`
  - [ ] `app/api/auth/register/route.ts`
  - [ ] `app/api/otp/generate/route.ts`
  - [ ] `app/api/otp/verify/route.ts`
  - [ ] `app/api/login-attempts/route.ts`
  - [ ] `app/api/otp-attempts/route.ts`

## Compilation & Build

- [ ] No TypeScript errors: `npm run build` succeeds
- [ ] Project builds successfully
- [ ] API routes are compiled
- [ ] Warnings but no errors

## Database Setup

- [ ] MongoDB connection established
- [ ] Collections will be auto-created on first use
- [ ] Admin user created via `/api/auth/register` endpoint

## Testing

### Database Tests
- [ ] Can connect to MongoDB
- [ ] Users collection exists
- [ ] LoginAttempts collection exists
- [ ] OTPAttempts collection exists

### API Tests
- [ ] `POST /api/auth/register` works
- [ ] `POST /api/auth/login` works
- [ ] `POST /api/otp/generate` works
- [ ] `POST /api/otp/verify` works
- [ ] `GET /api/login-attempts` works
- [ ] `GET /api/otp-attempts` works

### Frontend Tests
- [ ] Admin portal loads
- [ ] Login page functional
- [ ] OTP page functional
- [ ] Dashboard displays data
- [ ] Session persists correctly

## MongoDB Tools (Optional)

- [ ] MongoDB Compass downloaded (for GUI)
- [ ] MongoDB Shell (`mongosh`) installed (for CLI)
- [ ] Can view databases and collections

## Documentation

- [ ] Read MONGODB_SETUP.md
- [ ] Read SERVICES.md
- [ ] Read QUICKSTART.md
- [ ] Understand API endpoints

## Performance & Security

- [ ] Database indexes created
- [ ] Password hashing working (bcryptjs)
- [ ] OTP expiration configured (10 minutes)
- [ ] Session timeout configured (1 hour)
- [ ] Input validation in place

## Backup & Maintenance

- [ ] Have backup strategy planned
- [ ] Know how to export data
- [ ] Know how to import data
- [ ] Understand connection string security

## Issues Resolved

Document any issues and how they were resolved:

```
Issue 1: _______________
Solution: _______________

Issue 2: _______________
Solution: _______________
```

## Sign-Off

- [ ] All items checked
- [ ] System is fully functional
- [ ] Ready for development
- [ ] Ready for testing

**Date Completed:** ___________
**Completed By:** ___________
**Notes:** ___________________________________________________________
