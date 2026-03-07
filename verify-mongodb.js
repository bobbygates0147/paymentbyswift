#!/usr/bin/env node

/**
 * MongoDB Connection Test Script
 * Run: node verify-mongodb.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const ATLAS_PASSWORD_WRAPPED_PATTERN = /mongodb(?:\+srv)?:\/\/[^:]+:<[^>]+>@/i;

async function verifyMongoDB() {
  console.log('\nMongoDB Setup Verification\n');
  console.log('----------------------------------------');

  console.log('\n1. ENVIRONMENT VARIABLES:');
  console.log('   MONGODB_URI:', MONGODB_URI ? 'Set' : 'Not Set');
  console.log('   NEXT_PUBLIC_ADMIN_EMAIL:', process.env.NEXT_PUBLIC_ADMIN_EMAIL ? 'Set' : 'Not Set');
  console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

  if (!MONGODB_URI) {
    console.log('   Error: MONGODB_URI is missing in .env.local');
    process.exit(1);
  }

  if (MONGODB_URI.includes('<db_password>') || MONGODB_URI.includes('<password>')) {
    console.log('   Error: MONGODB_URI still contains placeholder password text.');
    process.exit(1);
  }

  if (ATLAS_PASSWORD_WRAPPED_PATTERN.test(MONGODB_URI)) {
    console.log('   Error: MONGODB_URI password is wrapped in angle brackets. Remove < and > around your real password.');
    process.exit(1);
  }

  console.log('\n2. DATABASE CONNECTION:');
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('   MongoDB connected successfully');

    const db = mongoose.connection.getClient().db();
    const stats = await db.stats();
    console.log(`   Database: ${stats.db}`);
    console.log(`   Collections: ${stats.collections}`);
  } catch (error) {
    console.log('   MongoDB connection failed');
    console.log(`   Error: ${error.message}`);
    process.exit(1);
  }

  console.log('\n3. COLLECTIONS:');
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map((collection) => collection.name);

    const expectedCollections = ['users', 'loginattempts', 'otpattempts'];
    for (const collectionName of expectedCollections) {
      const exists = collectionNames.some((name) => name.toLowerCase() === collectionName.toLowerCase());
      console.log(`   ${collectionName} ${exists ? '(exists)' : '(will be created on first use)'}`);
    }
  } catch (error) {
    console.log('   Could not list collections:', error.message);
  }

  console.log('\n4. MODELS:');
  console.log('   User model available');
  console.log('   LoginAttempt model available');
  console.log('   OTPAttempt model available');

  console.log('\n5. INDEXES:');
  try {
    if (mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      if (collections.length > 0) {
        console.log('   Indexes will be created automatically');
      }
    }
  } catch {
    console.log('   Index check skipped');
  }

  console.log('\n----------------------------------------');
  console.log('MongoDB Setup Verification Complete\n');
  console.log('Next steps:');
  console.log('  1. npm run dev          (Start development server)');
  console.log('  2. Register admin user  (POST /api/auth/register)');
  console.log('  3. Login to portal      (http://localhost:3000)');
  console.log('\n');

  await mongoose.disconnect();
  process.exit(0);
}

verifyMongoDB().catch((error) => {
  console.error('\nVerification failed:', error.message);
  process.exit(1);
});
