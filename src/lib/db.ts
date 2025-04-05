import { createPool } from 'mysql2/promise';

// Create a connection pool to the MySQL database
export const pool = createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Helper function to get a connection from the pool
export async function getConnection() {
  return pool.getConnection();
} 