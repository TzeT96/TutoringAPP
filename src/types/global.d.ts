interface Window {
  MediaRecorder: typeof MediaRecorder;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      AWS_ACCESS_KEY_ID: string;
      AWS_SECRET_ACCESS_KEY: string;
      AWS_REGION: string;
      AWS_S3_BUCKET: string;
      ADMIN_SETUP_KEY: string;
    }
  }
} 