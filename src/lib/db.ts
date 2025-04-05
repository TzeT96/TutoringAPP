import { createPool } from 'mysql2/promise';

// Create a connection pool to the MySQL database
export const pool = createPool({
  host: process.env.DB_HOST || 'mysql-38ed915f-gasxchenzhuo-1826.j.aivencloud.com',
  port: Number(process.env.DB_PORT || 19674),
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_uK1vNg5bd-vj8C280MG',
  database: process.env.DB_NAME || 'defaultdb',
});

// Helper function to get a connection from the pool
export async function getConnection() {
  return pool.getConnection();
} 