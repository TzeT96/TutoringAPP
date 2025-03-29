# Tutoring Application API Documentation

This document provides details about all the API endpoints available in the Tutoring Web UI application, their request/response formats, and usage examples.

## Base URL

All API endpoints are relative to:
```
https://myapptest4-ngrok.ngrok.io/api
```

For local development, you can use `http://localhost:3000/api`.

## Authentication

Authentication is handled via NextAuth.js. Most admin endpoints require authentication.

### Authentication Endpoints

#### Sign In
- **URL**: `/auth/signin`
- **Method**: `POST`
- **Description**: Authenticates a user and creates a session
- **Request Body**:
  ```json
  {
    "email": "admin@example.com",
    "password": "password123",
    "redirect": false,
    "callbackUrl": "https://myapptest4-ngrok.ngrok.io/admin"
  }
  ```
- **Response**: Status 200 OK with session cookies

#### Sign Out
- **URL**: `/auth/signout`
- **Method**: `POST`
- **Description**: Ends the user's session
- **Response**: Status 200 OK

## Admin API Endpoints

### Session Management

#### Get All Sessions
- **URL**: `/admin/sessions`
- **Method**: `GET`
- **Description**: Retrieves all tutoring sessions
- **Response**: Status 200 OK
  ```json
  [
    {
      "id": "cm8k5n8t50007103ayuzr5grc",
      "code": "3E0D3B",
      "createdAt": "2025-03-22T09:00:00.000Z",
      "status": "IN_PROGRESS",
      "startedAt": "2025-03-22T09:00:00.000Z",
      "userId": "user-1",
      "questions": [...]
    },
    ...
  ]
  ```

#### Get Session by ID
- **URL**: `/admin/sessions/{id}`
- **Method**: `GET`
- **Description**: Retrieves a specific session by ID
- **Response**: Status 200 OK
  ```json
  {
    "id": "cm8k5n8t50007103ayuzr5grc",
    "code": "3E0D3B",
    "createdAt": "2025-03-22T09:00:00.000Z",
    "status": "IN_PROGRESS",
    "startedAt": "2025-03-22T09:00:00.000Z",
    "userId": "user-1",
    "questions": [...]
  }
  ```

#### Get Session Questions
- **URL**: `/admin/sessions/{id}/questions`
- **Method**: `GET`
- **Description**: Retrieves questions for a specific session
- **Response**: Status 200 OK
  ```json
  [
    {
      "id": "cm8k5nf1s0001gcbgg3gbcap5",
      "text": "How do I solve this force diagram?",
      "verificationCode": {
        "code": "3E0D3B"
      },
      "answer": {
        "id": "cm8k5nqds000a103aa15fud86",
        "textAnswer": "To solve a force diagram, identify all forces acting on the object, draw vectors for each force, and find the net force by vector addition."
      }
    },
    ...
  ]
  ```

### Dashboard and Analytics

#### Get Dashboard Data
- **URL**: `/admin/dashboard`
- **Method**: `GET`
- **Description**: Retrieves dashboard statistics and course information
- **Response**: Status 200 OK
  ```json
  {
    "courses": [
      {
        "id": "course-1",
        "name": "PHY211: Introduction to Physics",
        "semester": "Spring 2025",
        "studentCount": 3,
        "highRiskCount": 0,
        "averageGrade": 85
      },
      ...
    ],
    "stats": {
      "totalStudents": 10,
      "highRiskRatio": 30,
      "averageGrade": 83.5,
      "submissionRate": 70
    }
  }
  ```

### Student Management

#### Get All Students
- **URL**: `/admin/students`
- **Method**: `GET`
- **Description**: Retrieves all students or students for a specific course
- **Query Parameters**:
  - `courseId` (optional): Filter students by course ID
- **Response**: Status 200 OK
  ```json
  [
    {
      "id": "student-2",
      "name": "Bob Smith",
      "email": "bob.smith@university.edu",
      "grade": 83,
      "riskLevel": "high",
      "emailStatus": "sent",
      "cheatingStatus": "pending",
      "sessions": 2,
      "completedSessions": 1
    },
    ...
  ]
  ```

#### Student Actions
- **URL**: `/admin/students`
- **Method**: `POST`
- **Description**: Perform actions on one or more students
- **Request Body**:
  ```json
  {
    "studentIds": ["student-1", "student-2"],
    "action": "sendEmail"
  }
  ```
- **Supported Actions**:
  - `sendEmail`: Send emails to selected students
  - `downloadReport`: Generate a report for selected students
- **Response**: Status 200 OK
  ```json
  {
    "message": "Emails sent successfully"
  }
  ```

## Student API Endpoints

### Verification Code

#### Verify Code
- **URL**: `/verify-code`
- **Method**: `POST`
- **Description**: Verifies a session verification code
- **Request Body**:
  ```json
  {
    "code": "3E0D3B"
  }
  ```
- **Response**: Status 200 OK
  ```json
  {
    "sessionId": "cm8k5n8t50007103ayuzr5grc",
    "questions": [
      {
        "id": "cm8k5q1z00003d4w6dj25ltyt",
        "text": "What is Newton's Second Law?"
      }
    ]
  }
  ```

### Questions and Answers

#### Get Questions By Code
- **URL**: `/questions/{code}`
- **Method**: `GET`
- **Description**: Retrieves questions associated with a verification code
- **Response**: Status 200 OK
  ```json
  {
    "questions": [
      {
        "id": "cm8k5q1z00003d4w6dj25ltyt",
        "text": "What is Newton's Second Law?",
        "answer": null
      }
    ],
    "currentQuestionIndex": 0,
    "isComplete": false
  }
  ```

#### Submit Answer
- **URL**: `/submit-answer`
- **Method**: `POST`
- **Description**: Submits an answer to a question
- **Request Body**:
  ```json
  {
    "questionId": "cm8k5q1z00003d4w6dj25ltyt",
    "code": "3E0D3B",
    "textAnswer": "F = ma (Force equals mass times acceleration)"
  }
  ```
- **Response**: Status 200 OK
  ```json
  {
    "message": "Answer submitted successfully",
    "answer": {
      "id": "cm8k5sbx5000e103a5fy9b9cz",
      "questionId": "cm8k5q1z00003d4w6dj25ltyt",
      "sessionId": "cm8k5n8t50007103ayuzr5grc",
      "videoUrl": null,
      "textAnswer": "F = ma (Force equals mass times acceleration)",
      "submittedAt": "2025-03-22T12:01:52.217Z"
    }
  }
  ```

#### Complete Session
- **URL**: `/complete-session`
- **Method**: `POST`
- **Description**: Marks a tutoring session as completed
- **Request Body**:
  ```json
  {
    "code": "3E0D3B"
  }
  ```
- **Response**: Status 200 OK
  ```json
  {
    "message": "Session completed successfully"
  }
  ```

#### Upload Video
- **URL**: `/upload-video`
- **Method**: `POST`
- **Description**: Uploads a video recording and associates it with an answer or session
- **Request Body**:
  ```json
  {
    "sessionId": "cm8k5n8t50007103ayuzr5grc",
    "questionId": "cm8k5q1z00003d4w6dj25ltyt", // optional, if null updates the session
    "videoBlob": "data:video/webm;base64,..." // base64 encoded video
  }
  ```
- **Response**: Status 200 OK
  ```json
  {
    "videoUrl": "https://tommy-demo-s3-v2.s3.us-west-1.amazonaws.com/cm8k5n8t50007103ayuzr5grc_cm8k5q1z00003d4w6dj25ltyt_1711192912217.webm"
  }
  ```

## Utility API Endpoints

### Code Management

#### Generate Code
- **URL**: `/generate-code`
- **Method**: `POST`
- **Description**: Generates a new verification code for a session
- **Request Body**:
  ```json
  {
    "sessionId": "cm8k5n8t50007103ayuzr5grc"
  }
  ```
- **Response**: Status 200 OK
  ```json
  {
    "code": "3E0D3B",
    "message": "Verification code generated successfully"
  }
  ```

#### Reset Code
- **URL**: `/reset-code`
- **Method**: `POST`
- **Description**: Resets or updates a verification code for a session
- **Request Body**:
  ```json
  {
    "sessionId": "cm8k5n8t50007103ayuzr5grc"
  }
  ```
- **Response**: Status 200 OK
  ```json
  {
    "message": "Verification code reset successfully",
    "code": "3E0D3B"
  }
  ```

## Error Handling

All API endpoints follow a consistent error handling pattern:

- **400 Bad Request**: Missing or invalid parameters
- **401 Unauthorized**: Authentication required
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **405 Method Not Allowed**: Incorrect HTTP method
- **500 Internal Server Error**: Server-side error

Error responses include a descriptive message:

```json
{
  "error": "Error message description"
}
```

## Database Schema

The application uses MySQL with Prisma ORM. The main models are:

1. **User**: Stores user information for authentication
2. **TutoringSession**: Contains session details
3. **VerificationCode**: Manages access codes for sessions
4. **Question**: Contains the questions for sessions
5. **Answer**: Stores answers to questions

All IDs are strings using the CUID format (example: cm8k5n8t50007103ayuzr5grc).

## Environment Configuration

The application requires the following environment variables:

```
# Database
DATABASE_URL="mysql://root:@localhost:3306/tutoring_app"

# NextAuth
NEXTAUTH_URL=https://myapptest4-ngrok.ngrok.io
NEXTAUTH_SECRET="your-secret-key"

# AWS S3
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="your-region"
AWS_S3_BUCKET="your-bucket-name"

# Admin Setup
ADMIN_SETUP_KEY="your-admin-setup-key"
```

## Migration to Production

When deploying to production:

1. Use a production-ready database (managed MySQL)
2. Set up proper HTTPS with a custom domain
3. Use environment variables for all secrets
4. Configure proper IAM policies for AWS S3 access
5. Set up monitoring and logging
6. Use a production deployment platform (Vercel, AWS, etc.) 