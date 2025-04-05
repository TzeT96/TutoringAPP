# Tutoring Application

A web application for managing tutoring sessions, student verification, and plagiarism checking.

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- MySQL database

### Installing

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in `.env.local` file:

```
DB_HOST=your-db-host
DB_PORT=your-db-port
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=your-db-name
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
AWS_REGION=your-aws-region
S3_BUCKET_NAME=your-s3-bucket
```

4. Run the development server:

```bash
npm run dev
```

## Deployment

This application is configured for deployment on Vercel. 

### Deploying to Vercel

1. Make sure you have the Vercel CLI installed:

```bash
npm i -g vercel
```

2. Login to Vercel:

```bash
vercel login
```

3. Deploy using our script:

```bash
./deploy.sh
```

Or deploy manually:

```bash
vercel
```

## Features

- Student verification system
- Session management
- Video recording and submission
- Analytics dashboard
- Plagiarism checking

## Technologies Used

- Next.js
- React
- TypeScript
- MySQL
- AWS S3 for video storage 