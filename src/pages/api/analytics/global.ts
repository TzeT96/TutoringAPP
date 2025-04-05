import { NextApiRequest, NextApiResponse } from 'next';
import { createPool } from 'mysql2/promise';

// Create a connection pool to the MySQL database
const pool = createPool({
  host: process.env.DB_HOST || 'mysql-38ed915f-gasxchenzhuo-1826.j.aivencloud.com',
  port: Number(process.env.DB_PORT || 19674),
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || 'AVNS_uK1vNg5bd-vj8C280MG',
  database: process.env.DB_NAME || 'defaultdb',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to the database
    const conn = await pool.getConnection();
    console.log('Connected to database for analytics');
    
    try {
      // Get total number of unique students
      const [totalStudentsResult] = await conn.query(`
        SELECT COUNT(DISTINCT JSON_UNQUOTE(JSON_EXTRACT(submission_detection_result, '$.student_email'))) as total_students
        FROM submission_detail_table
        WHERE JSON_EXTRACT(submission_detection_result, '$.student_email') IS NOT NULL
      `);
      
      const totalStudents = (totalStudentsResult as any[])[0]?.total_students || 0;
      
      // Get high risk students (those flagged for plagiarism)
      const [highRiskResult] = await conn.query(`
        SELECT COUNT(DISTINCT JSON_UNQUOTE(JSON_EXTRACT(submission_detection_result, '$.student_email'))) as high_risk_students
        FROM submission_detail_table
        WHERE JSON_EXTRACT(submission_detection_result, '$.ai_probability') > 0.7
      `);
      
      const highRiskStudents = (highRiskResult as any[])[0]?.high_risk_students || 0;
      
      // Get count of active sessions (submissions with verification questions)
      const [activeSessionsResult] = await conn.query(`
        SELECT COUNT(*) as active_sessions
        FROM submission_detail_table
        WHERE JSON_EXTRACT(submission_detection_result, '$.verification_questions') IS NOT NULL
      `);
      
      const activeSessions = (activeSessionsResult as any[])[0]?.active_sessions || 0;
      
      // Get monthly distribution of flagged students for cheating trends
      const [cheatingTrendsResult] = await conn.query(`
        SELECT 
          DATE_FORMAT(submission_time, '%Y-%m') as month,
          COUNT(*) as count
        FROM 
          submission_detail_table
        WHERE 
          JSON_EXTRACT(submission_detection_result, '$.ai_probability') > 0.7
        GROUP BY 
          DATE_FORMAT(submission_time, '%Y-%m')
        ORDER BY 
          month ASC
      `);
      
      // Convert the monthly data to the format needed for the chart
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const cheatingTrends = Array(12).fill(0);
      
      (cheatingTrendsResult as any[]).forEach(row => {
        const [year, month] = row.month.split('-');
        const monthIndex = parseInt(month) - 1; // Convert to 0-based index
        cheatingTrends[monthIndex] = row.count;
      });
      
      const monthLabels = months.map((month, index) => {
        return month;
      });
      
      return res.status(200).json({
        totalStudents,
        highRiskStudents,
        activeSessions,
        cheatingTrends: {
          labels: monthLabels,
          data: cheatingTrends
        }
      });
      
    } finally {
      conn.release();
    }
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
} 