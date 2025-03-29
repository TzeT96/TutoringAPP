import { mockTeachers } from '@/data/mockData';

// Type definitions for the admin data
export interface ExtendedCourse {
  id: string;
  name: string;
  code: string;
  semester: string;
  studentCount: number;
  highRiskCount?: number;
  averageGrade?: number;
  assignments: ExtendedAssignment[];
  students: Student[];
}

export interface ExtendedAssignment {
  id: string;
  title: string;
  type: string;
  dueDate: Date;
  totalPoints: number;
  studentResults: StudentResult[];
}

export interface StudentResult {
  studentId: string;
  studentName: string;
  studentEmail: string;
  score: number;
  submissionDate: Date;
  plagiarismStatus: string;
  similarityScore: number;
  verificationQuestions?: string[];
  canvasUrl?: string;
  requiresVerification?: boolean;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  riskLevel?: 'low' | 'medium' | 'high';
  emailStatus?: 'pending' | 'sent';
  plagiarismStatus?: string;
  status?: string;
  score?: number;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
}

// Data service functions
export async function getTeacher(teacherId: string): Promise<Teacher | null> {
  try {
    const response = await fetch(`/api/teacher?id=${teacherId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch teacher');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching teacher:", error);
    // Fallback to mock data if API call fails
    return mockTeachers[0];
  }
}

export async function getTeacherCourses(): Promise<ExtendedCourse[]> {
  try {
    const response = await fetch('/api/courses');
    if (!response.ok) {
      throw new Error('Failed to fetch courses');
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
} 