import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Check for a secret key to prevent unauthorized seeding
  const { secretKey } = req.body;
  if (secretKey !== process.env.ADMIN_SETUP_KEY) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Clear existing data
    await prisma.studentResult.deleteMany({});
    await prisma.studentCourse.deleteMany({});
    await prisma.assignment.deleteMany({});
    await prisma.course.deleteMany({});
    await prisma.student.deleteMany({});
    
    // Create admin user if it doesn't exist
    const adminExists = await prisma.user.findUnique({
      where: { email: 'admin@example.com' },
    });

    if (!adminExists) {
      await prisma.user.create({
        data: {
          email: 'admin@example.com',
          name: 'Admin User',
          password: await bcrypt.hash('password123', 10),
          role: 'admin',
        },
      });
    }

    // Create teacher user
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@example.com' },
      update: {},
      create: {
        email: 'teacher@example.com',
        name: 'Professor Johnson',
        password: await bcrypt.hash('password123', 10),
        role: 'teacher',
      },
    });

    // Create students
    const students = [];
    const studentNames = [
      'Alice Smith', 'Bob Johnson', 'Carol Williams', 'Dave Brown', 
      'Eve Davis', 'Frank Miller', 'Grace Wilson', 'Henry Moore',
      'Ivy Taylor', 'Jack Anderson', 'Karen Thomas', 'Leo White',
      'Mia Harris', 'Noah Martin', 'Olivia Thompson', 'Peter Garcia',
      'Quinn Martinez', 'Ryan Robinson', 'Sofia Lewis', 'Tyler Lee'
    ];

    for (let i = 0; i < studentNames.length; i++) {
      const student = await prisma.student.create({
        data: {
          name: studentNames[i],
          email: `student${i+1}@example.com`,
        },
      });
      students.push(student);
    }

    // Create courses
    const courses = [
      {
        name: 'Introduction to Computer Science',
        code: 'CS101',
        semester: 'Spring 2023',
      },
      {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        semester: 'Spring 2023',
      },
      {
        name: 'Database Systems',
        code: 'CS301',
        semester: 'Spring 2023',
      }
    ];

    const createdCourses = [];
    for (const courseData of courses) {
      const course = await prisma.course.create({
        data: {
          ...courseData,
          teacherId: teacher.id,
        },
      });
      createdCourses.push(course);
    }

    // Assign students to courses
    for (const course of createdCourses) {
      // Randomly assign 10-15 students to each course
      const numberOfStudents = Math.floor(Math.random() * 6) + 10; // 10-15 students
      const shuffledStudents = [...students].sort(() => 0.5 - Math.random());
      const courseStudents = shuffledStudents.slice(0, numberOfStudents);
      
      for (const student of courseStudents) {
        await prisma.studentCourse.create({
          data: {
            studentId: student.id,
            courseId: course.id,
          },
        });
      }

      // Update student count
      await prisma.course.update({
        where: { id: course.id },
        data: { studentCount: numberOfStudents },
      });

      // Create assignments for this course
      const assignments = [
        {
          title: 'Midterm Exam',
          type: 'exam',
          dueDate: new Date('2023-03-15'),
          totalPoints: 100,
        },
        {
          title: 'Final Project',
          type: 'assignment',
          dueDate: new Date('2023-04-30'),
          totalPoints: 100,
        },
        {
          title: 'Quiz 1',
          type: 'quiz',
          dueDate: new Date('2023-02-15'),
          totalPoints: 20,
        },
        {
          title: 'Quiz 2',
          type: 'quiz',
          dueDate: new Date('2023-03-01'),
          totalPoints: 20,
        },
        {
          title: 'Homework Assignment 1',
          type: 'assignment',
          dueDate: new Date('2023-02-28'),
          totalPoints: 50,
        }
      ];

      for (const assignmentData of assignments) {
        const assignment = await prisma.assignment.create({
          data: {
            ...assignmentData,
            courseId: course.id,
          },
        });

        // Create student results for this assignment
        let totalScore = 0;
        let highRiskCount = 0;

        for (const student of courseStudents) {
          // Randomly generate scores and plagiarism statuses
          const score = Math.floor(Math.random() * (assignment.totalPoints * 0.4)) + (assignment.totalPoints * 0.6); // 60-100% of total
          
          // For demonstration, let's make some plagiarism cases
          let plagiarismStatus = 'cleared';
          let similarityScore = Math.floor(Math.random() * 20); // 0-19%
          
          // Make approximately 15% of submissions suspicious
          if (Math.random() < 0.15) {
            plagiarismStatus = Math.random() < 0.7 ? 'suspected' : 'confirmed';
            similarityScore = plagiarismStatus === 'suspected' 
              ? Math.floor(Math.random() * 30) + 40 // 40-69%
              : Math.floor(Math.random() * 30) + 70; // 70-99%
            highRiskCount++;
          }

          await prisma.studentResult.create({
            data: {
              studentId: student.id,
              assignmentId: assignment.id,
              score,
              submissionDate: new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000)), // Random date in the last week
              plagiarismStatus,
              similarityScore,
            },
          });

          totalScore += score;
        }

        // Update the average grade for the course
        const averageGrade = totalScore / (courseStudents.length * assignment.totalPoints) * 100;
        await prisma.course.update({
          where: { id: course.id },
          data: { 
            averageGrade,
            // We could also update highRiskCount here if needed
          },
        });
      }
    }

    res.status(200).json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error);
    res.status(500).json({ message: 'Error seeding database', error });
  }
} 