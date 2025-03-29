# API Testing Documentation

This document provides instructions on how to test the APIs in the Tutoring Web UI application, to ensure they're functioning correctly with mock data and will be ready for migration to a real database.

## Overview

The testing setup consists of:

1. **api-test.js** - Contains test definitions for all API endpoints
2. **api-test.html** - Browser-based UI for running tests
3. **run-api-tests.js** - Node.js script for running tests from the command line

## API Endpoints Tested

The following API endpoints are tested:

### Authentication APIs
- `/api/auth/signin` - Sign in as admin or student
- `/api/auth/signup` - User registration (not fully implemented)

### Admin APIs
- `/api/admin/sessions` - Get all tutoring sessions
- `/api/admin/sessions/[id]` - Get a specific session by ID
- `/api/admin/sessions/[id]/questions` - Get questions for a specific session
- `/api/admin/dashboard` - Get dashboard analytics data
- `/api/admin/students` - Get all students

### Student APIs
- `/api/verify-code` - Verify a session code
- `/api/questions/[code]` - Get questions for a verification code
- `/api/submit-answer` - Submit an answer to a question
- `/api/complete-session` - Complete a tutoring session

### Utility APIs
- `/api/generate-code` - Generate a new verification code
- `/api/reset-code` - Reset an existing verification code

## How to Run Tests

### Method 1: Browser-Based Testing

1. Make sure the Next.js application is running on `http://localhost:3000`
2. Open `api-test.html` in a web browser
3. Click the "Run All API Tests" button
4. View the test results in the output panel

### Method 2: Node.js Testing

1. Make sure the Next.js application is running on `http://localhost:3000`
2. Install the required dependencies:
   ```
   npm install --no-save node-fetch@2
   ```
3. Run the tests:
   ```
   node run-api-tests.js
   ```

## Test Results Interpretation

The test output will show:

- ✅ Success - API endpoint returned the expected status code
- ❌ Failed - API endpoint returned an unexpected status code
- ❌ Error - An error occurred during the request

A summary of passed and failed tests will be displayed at the end.

## Migration to Real Database

When migrating from mock data to a real database, consider the following:

1. **Update Connection Strings**: Set the `DATABASE_URL` environment variable correctly for your MySQL database
2. **Modify API Endpoints**: Replace mock data operations with actual database queries
3. **Update Prisma Models**: Ensure your Prisma schema matches your database structure
4. **Test Incrementally**: Test one API endpoint at a time to ensure smooth migration

## Troubleshooting

- If tests fail with connection errors, make sure the Next.js development server is running
- If you get authentication errors, check that the credentials match those in the mock data
- For Prisma errors, verify that your database is properly configured and the environment variables are set correctly

## Additional Notes

- The mock data is currently stored in memory and does not persist between server restarts
- Some API endpoints may show success even if they're using mock data instead of the actual database
- Test results will help identify which endpoints need to be updated for production use 