import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const sessions = await prisma.submissionDetail.findMany({
      where: {
        submission_detection_result: {
          path: 'requires_verification',
          equals: 1
        }
      },
      select: {
        id: true,
        submission_detection_result: true,
        submission_time: true,
        assignment_id: true
      }
    });

    return res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
} 