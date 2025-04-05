export interface MockSession {
  id: string;
  code: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface MockQuestion {
  id: string;
  text: string;
  sessionId: string;
  studentId: string;
  answered: boolean;
  answer?: {
    id: string;
    videoUrl: string;
    textAnswer: string | null;
  };
}

export const mockSessions: MockSession[] = [
  { id: 'session-phy211-exam-1-student-2', code: 'DEF456', status: 'pending' },
  { id: 'session-phy211-quiz-1-student-2', code: 'MNO345', status: 'pending' },
  { id: 'session-phy211-assignment-1-student-2', code: 'PQR678', status: 'pending' },
  { id: 'session-math101-exam-1-student-4', code: 'VWX234', status: 'pending' },
  { id: 'session-math101-quiz-1-student-5', code: 'YZA567', status: 'pending' },
  { id: 'session-phy211-exam-2-student-3', code: 'ABC123', status: 'pending' }
];

export const mockQuestions: MockQuestion[] = [
  {
    id: 'q2',
    text: 'How do I solve this force diagram?',
    sessionId: 'session-phy211-exam-1-student-2',
    studentId: 'student-2',
    answered: false
  },
  {
    id: 'q3',
    text: 'Explain the concept of momentum.',
    sessionId: 'session-phy211-exam-2-student-3',
    studentId: 'student-3',
    answered: false
  },
  {
    id: 'q4',
    text: 'What is the relationship between force and acceleration?',
    sessionId: 'session-phy211-exam-2-student-3',
    studentId: 'student-3',
    answered: false
  },
  {
    id: 'q5',
    text: 'How does energy conservation apply to this system?',
    sessionId: 'session-phy211-exam-2-student-3',
    studentId: 'student-3',
    answered: false
  },
  {
    id: 'q6',
    text: 'Explain the concept of work and its relationship to energy.',
    sessionId: 'session-phy211-exam-2-student-3',
    studentId: 'student-3',
    answered: false
  }
]; 