// Mock data for demonstration purposes
export interface Student {
  id: string;
  name: string;
  email: string;
  grade?: string;
  score?: number;
  riskLevel: 'low' | 'medium' | 'high';
  emailStatus: 'pending' | 'sent' | 'failed';
  plagiarismStatus: 'cleared' | 'suspected' | 'confirmed' | 'unknown';
  status: 'pending' | 'attended' | 'missed';
  notes?: string;
  verificationCode?: string;
  sessionCompleted?: boolean;
  sessionScore?: number;
}

export interface Assignment {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'exam';
  dueDate: string;
  totalPoints: number;
  studentResults: StudentResult[];
  courseId?: string;
  courseName?: string;
  averageScore?: number;
  submissions?: number;
}

export interface StudentResult {
  studentId: string;
  studentName: string;
  studentEmail?: string;
  score: number;
  submissionDate: string;
  plagiarismStatus: 'cleared' | 'suspected' | 'confirmed' | 'unknown';
  similarityScore: number;
}

export interface Course {
  id: string;
  name: string;
  teacherId: string;
  instructor: string;
  studentCount: number;
  startDate: string;
  endDate: string;
  assignments: Assignment[];
}

export interface Session {
  id: string;
  courseId: string;
  course: string;
  assignmentId: string;
  assignment: string;
  date: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  students: Student[];
  plagiarismCase: PlagiarismCase;
  verificationCode?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  courses: string[];
}

export interface StudentQuestions {
  studentId: string;
  studentName: string;
  questions: string[];
}

export interface TutoringQuestion {
  id: string;
  text: string;
  sessionId: string;
  studentId: string;
  answered: boolean;
  answer?: string;
}

export interface PlagiarismCase {
  assignmentType: string;
  similarityScore: number;
  description: string;
  studentQuestions: StudentQuestions[];
}

// Function to determine grade based on score
function getGradeFromScore(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

// Create fixed verification codes instead of random ones
const studentVerificationCodes: {[id: string]: string} = {
  'student-1': 'ABC123',
  'student-2': 'DEF456',
  'student-3': 'GHI789',
  'student-4': 'JKL012',
  'student-5': 'MNO345',
  'student-6': 'PQR678',
  'student-7': 'STU901',
  'student-8': 'VWX234',
  'student-9': 'YZA567',
  'student-10': 'BCD890',
};

// Create mock students for PHY211 with fixed values
const PHY211Students: Student[] = [
  {
    id: 'student-1',
    name: 'Alice Johnson',
    email: 'alice.johnson@university.edu',
    grade: 'B',
    score: 85,
    riskLevel: 'low',
    emailStatus: 'sent',
    plagiarismStatus: 'cleared',
    status: 'attended',
    verificationCode: studentVerificationCodes['student-1'],
    sessionCompleted: true,
    sessionScore: 92
  },
  {
    id: 'student-2',
    name: 'Bob Smith',
    email: 'bob.smith@university.edu',
    grade: 'C',
    score: 72,
    riskLevel: 'high',
    emailStatus: 'sent',
    plagiarismStatus: 'suspected',
    status: 'attended',
    verificationCode: studentVerificationCodes['student-2'],
    sessionCompleted: false
  },
  {
    id: 'student-3',
    name: 'Charlie Davis',
    email: 'charlie.davis@university.edu',
    grade: 'A',
    score: 91,
    riskLevel: 'low',
    emailStatus: 'sent',
    plagiarismStatus: 'cleared',
    status: 'attended',
    verificationCode: studentVerificationCodes['student-3'],
    sessionCompleted: true,
    sessionScore: 95
  },
  {
    id: 'student-4',
    name: 'Diana Miller',
    email: 'diana.miller@university.edu',
    grade: 'B',
    score: 83,
    riskLevel: 'medium',
    emailStatus: 'sent',
    plagiarismStatus: 'suspected',
    status: 'pending',
    verificationCode: studentVerificationCodes['student-4'],
    sessionCompleted: false
  },
  {
    id: 'student-5',
    name: 'Ethan Wilson',
    email: 'ethan.wilson@university.edu',
    grade: 'D',
    score: 65,
    riskLevel: 'high',
    emailStatus: 'sent',
    plagiarismStatus: 'confirmed',
    status: 'missed',
    verificationCode: studentVerificationCodes['student-5'],
    sessionCompleted: false
  }
];

// Generate PHY211 assignments with fixed values
const PHY211Assignments: Assignment[] = [
  {
    id: 'phy211-exam-1',
    title: 'Midterm Exam',
    type: 'exam',
    dueDate: '2023-03-15T00:00:00Z',
    totalPoints: 100,
    studentResults: [
      {
        studentId: 'student-1',
        studentName: 'Alice Johnson',
        studentEmail: 'alice.johnson@university.edu',
        score: 85,
        submissionDate: '2023-03-15T14:30:00Z',
        plagiarismStatus: 'cleared',
        similarityScore: 5
      },
      {
        studentId: 'student-2',
        studentName: 'Bob Smith',
        studentEmail: 'bob.smith@university.edu',
        score: 72,
        submissionDate: '2023-03-15T14:45:00Z',
        plagiarismStatus: 'suspected',
        similarityScore: 65
      },
      {
        studentId: 'student-3',
        studentName: 'Charlie Davis',
        studentEmail: 'charlie.davis@university.edu',
        score: 91,
        submissionDate: '2023-03-15T14:20:00Z',
        plagiarismStatus: 'cleared',
        similarityScore: 12
      }
    ]
  },
  {
    id: 'phy211-quiz-1',
    title: 'Newton\'s Laws Quiz',
    type: 'quiz',
    dueDate: '2023-02-10T00:00:00Z',
    totalPoints: 20,
    studentResults: [
      {
        studentId: 'student-1',
        studentName: 'Alice Johnson',
        studentEmail: 'alice.johnson@university.edu',
        score: 18,
        submissionDate: '2023-02-10T10:15:00Z',
        plagiarismStatus: 'cleared',
        similarityScore: 10
      },
      {
        studentId: 'student-2',
        studentName: 'Bob Smith',
        studentEmail: 'bob.smith@university.edu',
        score: 16,
        submissionDate: '2023-02-10T10:30:00Z',
        plagiarismStatus: 'suspected',
        similarityScore: 15
      }
    ]
  },
  {
    id: 'phy211-assignment-1',
    title: 'Physics Lab Report',
    type: 'assignment',
    dueDate: '2023-04-05T00:00:00Z',
    totalPoints: 50,
    studentResults: [
      {
        studentId: 'student-2',
        studentName: 'Bob Smith',
        studentEmail: 'bob.smith@university.edu',
        score: 32,
        submissionDate: '2023-04-05T23:59:00Z',
        plagiarismStatus: 'confirmed',
        similarityScore: 85
      },
      {
        studentId: 'student-3',
        studentName: 'Charlie Davis',
        studentEmail: 'charlie.davis@university.edu',
        score: 47,
        submissionDate: '2023-04-03T14:20:00Z',
        plagiarismStatus: 'cleared',
        similarityScore: 12
      }
    ]
  }
];

// Create the PHY211 course
const PHY211Course: Course = {
  id: 'course-1',
  name: 'PHY211: Introduction to Physics',
  teacherId: 'teacher-1',
  instructor: 'Dr. Robert Chen',
  studentCount: 120,
  startDate: '2023-01-15T00:00:00Z',
  endDate: '2023-05-15T00:00:00Z',
  assignments: PHY211Assignments
};

// Generate MATH101 assignments with fixed values
const MATH101Assignments: Assignment[] = [
  {
    id: 'math101-exam-1',
    title: 'Calculus Midterm',
    type: 'exam',
    dueDate: '2023-03-10T00:00:00Z',
    totalPoints: 100,
    studentResults: [
      {
        studentId: 'student-4',
        studentName: 'Diana Miller',
        studentEmail: 'diana.miller@university.edu',
        score: 78,
        submissionDate: '2023-03-10T15:20:00Z',
        plagiarismStatus: 'suspected',
        similarityScore: 55
      },
      {
        studentId: 'student-5',
        studentName: 'Ethan Wilson',
        studentEmail: 'ethan.wilson@university.edu',
        score: 62,
        submissionDate: '2023-03-10T15:55:00Z',
        plagiarismStatus: 'confirmed',
        similarityScore: 90
      }
    ]
  },
  {
    id: 'math101-quiz-1',
    title: 'Integration Quiz',
    type: 'quiz',
    dueDate: '2023-02-20T00:00:00Z',
    totalPoints: 25,
    studentResults: [
      {
        studentId: 'student-5',
        studentName: 'Ethan Wilson',
        studentEmail: 'ethan.wilson@university.edu',
        score: 15,
        submissionDate: '2023-02-20T09:30:00Z',
        plagiarismStatus: 'suspected',
        similarityScore: 60
      }
    ]
  }
];

// Create the MATH101 course
const MATH101Course: Course = {
  id: 'course-2',
  name: 'MATH101: Calculus I',
  teacherId: 'teacher-2',
  instructor: 'Dr. Sarah Johnson',
  studentCount: 150,
  startDate: '2023-01-15T00:00:00Z',
  endDate: '2023-05-15T00:00:00Z',
  assignments: MATH101Assignments
};

// Combine all courses
export const mockCourses: Course[] = [PHY211Course, MATH101Course];

// Create teachers
export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Dr. Robert Chen',
    email: 'robert.chen@university.edu',
    department: 'Physics',
    courses: ['PHY211: Introduction to Physics', 'PHY302: Quantum Mechanics']
  },
  {
    id: 'teacher-2',
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@university.edu',
    department: 'Mathematics',
    courses: ['MATH101: Calculus I', 'MATH201: Linear Algebra']
  }
];

// Fixed verification codes for sessions 
const sessionVerificationCodes: {[sessionId: string]: string} = {
  'session-phy211-exam-1-student-1': 'ABC123',
  'session-phy211-exam-1-student-2': 'DEF456',
  'session-phy211-exam-1-student-3': 'GHI789',
  'session-phy211-quiz-1-student-1': 'JKL012',
  'session-phy211-quiz-1-student-2': 'MNO345',
  'session-phy211-assignment-1-student-2': 'PQR678',
  'session-phy211-assignment-1-student-3': 'STU901',
  'session-math101-exam-1-student-4': 'VWX234',
  'session-math101-quiz-1-student-5': 'YZA567',
};

// Fixed session statuses (true = completed, false = scheduled)
const sessionCompletionStatus: {[sessionId: string]: boolean} = {
  'session-phy211-exam-1-student-1': true,
  'session-phy211-exam-1-student-2': false,
  'session-phy211-exam-1-student-3': true,
  'session-phy211-quiz-1-student-1': true,
  'session-phy211-quiz-1-student-2': false,
  'session-phy211-assignment-1-student-2': false,
  'session-phy211-assignment-1-student-3': true,
  'session-math101-exam-1-student-4': false,
  'session-math101-quiz-1-student-5': true,
};

// Generate tutoring questions for a session
const generateTutoringQuestions = (sessionId: string, studentId: string): string[] => {
  const baseQuestions = [
    "Explain your approach to solving this problem. What concepts did you apply?",
    "Where did you find information to help you complete this assignment?",
    "Can you walk through your solution step by step?",
    "What parts of this assignment were most challenging for you?",
    "How confident are you in your understanding of the concepts in this assignment?"
  ];
  
  return baseQuestions;
};

// Create static mock sessions based on assignments with suspected plagiarism
export const mockSessions: Session[] = [];

// Add sessions for PHY211
PHY211Course.assignments.forEach(assignment => {
  const suspectedStudents = assignment.studentResults.filter(
    result => result.plagiarismStatus === 'suspected' || result.plagiarismStatus === 'confirmed'
  );
  
  suspectedStudents.forEach(result => {
    const sessionId = `session-${assignment.id}-${result.studentId}`;
    
    // Use fixed date instead of random
    const date = new Date('2023-04-15T14:00:00Z');
    
    // Use predetermined completion status
    const completed = sessionCompletionStatus[sessionId] !== undefined 
      ? sessionCompletionStatus[sessionId] 
      : false;
    
    const student = PHY211Students.find(s => s.id === result.studentId);
    if (!student) return;
    
    const session: Session = {
      id: sessionId,
      courseId: PHY211Course.id,
      course: PHY211Course.name,
      assignmentId: assignment.id,
      assignment: assignment.title,
      date: date.toISOString(),
      status: completed ? 'completed' : 'scheduled',
      students: [student],
      plagiarismCase: {
        assignmentType: assignment.type,
        similarityScore: result.similarityScore,
        description: 'Plagiarism case investigation',
        studentQuestions: [
          {
            studentId: result.studentId,
            studentName: result.studentName,
            questions: generateTutoringQuestions(sessionId, result.studentId)
          }
        ]
      },
      // Use predetermined verification code
      verificationCode: sessionVerificationCodes[sessionId] || `CODE-${sessionId.substring(0, 4)}`
    };
    
    mockSessions.push(session);
  });
});

// Add sessions for MATH101
MATH101Course.assignments.forEach(assignment => {
  const suspectedStudents = assignment.studentResults.filter(
    result => result.plagiarismStatus === 'suspected' || result.plagiarismStatus === 'confirmed'
  );
  
  suspectedStudents.slice(0, 5).forEach(result => {
    const sessionId = `session-${assignment.id}-${result.studentId}`;
    
    // Use fixed date instead of random
    const date = new Date('2023-04-18T10:00:00Z');
    
    // Use predetermined completion status
    const completed = sessionCompletionStatus[sessionId] !== undefined 
      ? sessionCompletionStatus[sessionId] 
      : false;
    
    const student = PHY211Students.find(s => s.id === result.studentId);
    const studentObj = student || {
      id: result.studentId,
      name: result.studentName,
      email: result.studentEmail || '',
      grade: getGradeFromScore(result.score),
      score: result.score,
      riskLevel: 'low', 
      emailStatus: 'pending',
      plagiarismStatus: 'unknown',
      status: 'pending',
      sessionCompleted: false
    };
    
    const session: Session = {
      id: sessionId,
      courseId: MATH101Course.id,
      course: MATH101Course.name,
      assignmentId: assignment.id,
      assignment: assignment.title,
      date: date.toISOString(),
      status: completed ? 'completed' : 'scheduled',
      students: [studentObj],
      plagiarismCase: {
        assignmentType: assignment.type,
        similarityScore: result.similarityScore,
        description: 'Plagiarism case investigation',
        studentQuestions: [
          {
            studentId: result.studentId,
            studentName: result.studentName,
            questions: generateTutoringQuestions(sessionId, result.studentId)
          }
        ]
      },
      // Use predetermined verification code
      verificationCode: sessionVerificationCodes[sessionId] || `CODE-${sessionId.substring(0, 4)}`
    };
    
    mockSessions.push(session);
  });
});

// Add mock questions with static data
export const mockQuestions: TutoringQuestion[] = [
  {
    id: 'q1',
    text: 'Can you explain Newton\'s First Law?',
    sessionId: 'session-phy211-exam-1-student-1',
    studentId: 'student-1',
    answered: false
  },
  {
    id: 'q2',
    text: 'How do I solve this force diagram?',
    sessionId: 'session-phy211-exam-1-student-2',
    studentId: 'student-2',
    answered: false
  },
  {
    id: 'q3',
    text: 'Can you help me understand momentum conservation?',
    sessionId: 'session-phy211-exam-1-student-3',
    studentId: 'student-3',
    answered: false
  },
  {
    id: 'q4',
    text: 'What is the difference between velocity and acceleration?',
    sessionId: 'session-phy211-quiz-1-student-2',
    studentId: 'student-2',
    answered: false
  },
  {
    id: 'q5',
    text: 'How do I calculate the work done by a force?',
    sessionId: 'session-math101-exam-1-student-4',
    studentId: 'student-4',
    answered: false
  }
];

// Update mock data export with all fixed static data
export const mockData = {
  courses: mockCourses,
  sessions: mockSessions,
  teachers: mockTeachers,
  questions: mockQuestions
};