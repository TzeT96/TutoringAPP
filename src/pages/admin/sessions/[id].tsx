import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../../components/AdminLayout';
import { FiChevronLeft, FiCheck, FiX, FiFile } from 'react-icons/fi';
import { Session as MockSession, StudentQuestions, mockSessions } from '@/data/mockData';

interface Answer {
  id: string;
  videoUrl: string | null;
  textAnswer: string | null;
  text?: string | null;
  submittedAt: string;
}

interface Question {
  id: string;
  text: string;
  verificationCode: {
    code: string;
  };
  answer: Answer | null;
}

// Combine our database-style model with mock data model for compatibility
interface TutoringSession {
  id: string;
  code?: string;
  createdAt?: string;
  status: string;
  startedAt?: string;
  questions?: Question[];
  // Mock data properties
  courseId?: string;
  course?: string;
  assignmentId?: string;
  assignment?: string;
  date?: string | Date;
  students?: any[];
  plagiarismCase?: {
    assignmentType: string;
    similarityScore: number;
    description: string;
    studentQuestions: StudentQuestions[];
  };
  verificationCode?: string;
}

export default function SessionDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [session, setSession] = useState<TutoringSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestionText, setEditedQuestionText] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchSession = async () => {
      try {
        // First try to fetch from real API
        try {
          const response = await fetch(`/api/real-sessions/${id}`);
          if (response.ok) {
            const data = await response.json();
            setSession(data);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.error('Real API fetch failed, falling back to API endpoint:', apiErr);
        }

        // Then try the regular API
        try {
          const response = await fetch(`/api/admin/sessions/${id}`);
          if (response.ok) {
            const data = await response.json();
            setSession(data);
            setLoading(false);
            return;
          }
        } catch (apiErr) {
          console.error('API fetch failed, falling back to mock data:', apiErr);
        }

        // Fall back to mock data if API fails
        const mockSession = mockSessions.find(s => s.id === id);
        if (mockSession) {
          setSession(mockSession);
        } else {
          throw new Error('Session not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      // First try with real API
      try {
        const response = await fetch(`/api/real-sessions/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          const updatedSession = await response.json();
          setSession(prev => prev ? { ...prev, status: newStatus } : null);
          return;
        }
      } catch (apiErr) {
        console.error('Real API update failed, trying regular API:', apiErr);
      }
      
      // Then try regular API
      const response = await fetch(`/api/admin/sessions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update session status');
      }

      const updatedSession = await response.json();
      setSession(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update session status');
    }
  };

  const handleEditQuestion = async (questionId: string) => {
    if (!editedQuestionText.trim()) return;

    try {
      const response = await fetch(`/api/admin/sessions/${id}/questions/${questionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: editedQuestionText }),
      });

      if (!response.ok) {
        throw new Error('Failed to update question');
      }

      const updatedQuestion = await response.json();
      setSession(prev => {
        if (!prev || !prev.questions) return prev;
        return {
          ...prev,
          questions: prev.questions.map(q => 
            q.id === questionId ? updatedQuestion : q
          ),
        };
      });
      setEditingQuestionId(null);
      setEditedQuestionText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update question');
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      const response = await fetch(`/api/admin/sessions/${id}/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete question');
      }

      setSession(prev => {
        if (!prev || !prev.questions) return prev;
        return {
          ...prev,
          questions: prev.questions.filter(q => q.id !== questionId),
        };
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </AdminLayout>
    );
  }

  if (!session) {
    return (
      <AdminLayout>
        <div className="text-center p-4">Session not found</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push(`/admin/sessions`)}
            className="flex items-center text-indigo-600 hover:text-indigo-900"
          >
            <FiChevronLeft className="mr-1" />
            Back to Sessions
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleUpdateStatus('APPROVED')}
              className={`px-4 py-2 border rounded-md ${
                session.status === 'APPROVED' 
                  ? 'bg-green-100 text-green-800 border-green-300' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiCheck className="inline-block mr-1" />
              Approve
            </button>
            <button
              onClick={() => handleUpdateStatus('REJECTED')}
              className={`px-4 py-2 border rounded-md ${
                session.status === 'REJECTED' 
                  ? 'bg-red-100 text-red-800 border-red-300' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FiX className="inline-block mr-1" />
              Reject
            </button>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Session Details</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p><span className="font-medium">Session ID:</span> {session.id}</p>
                <p><span className="font-medium">Verification Code:</span> {session.code || session.verificationCode}</p>
                <p><span className="font-medium">Created:</span> {session.createdAt ? new Date(session.createdAt).toLocaleString() : 'N/A'}</p>
                <p><span className="font-medium">Status:</span> {session.status}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">Academic Details</h3>
              <div className="mt-2 text-sm text-gray-500">
                <p><span className="font-medium">Course:</span> {session.course}</p>
                <p><span className="font-medium">Assignment:</span> {session.assignment}</p>
                <p><span className="font-medium">Students:</span> {session.students ? session.students.map(s => s.name).join(', ') : 'N/A'}</p>
                {session.plagiarismCase && (
                  <p>
                    <span className="font-medium">Similarity Score:</span> 
                    <span className="ml-1 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      {session.plagiarismCase.similarityScore}%
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Verification Questions</h3>
          </div>
          
          <ul className="divide-y divide-gray-200">
            {/* First show API-fetched questions */}
            {session.questions && session.questions.map((question, index) => (
              <li key={question.id} className="p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                    <span className="text-lg font-medium text-indigo-700">{index + 1}</span>
                  </div>
                  <div className="ml-4 flex-1">
                    <p className="text-md font-medium text-gray-900">{question.text.trim().replace(/^,\s*/, '')}</p>
                    
                    {question.answer ? (
                      <div className="mt-3 bg-gray-50 rounded-md p-3">
                        <div className="flex items-center text-sm text-gray-500 mb-2">
                          <FiFile className="mr-1" />
                          Student Answer
                        </div>
                        
                        <p className="text-gray-700">
                          {question.answer.textAnswer || question.answer.text || "No text answer provided"}
                        </p>
                        
                        {question.answer.videoUrl && (
                          <div className="mt-3">
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Video Response</h4>
                            <video 
                              src={question.answer.videoUrl} 
                              controls 
                              className="w-full max-w-md rounded"
                              preload="metadata"
                            />
                            <p className="mt-1 text-xs text-gray-500">
                              Submitted: {new Date(question.answer.submittedAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm text-gray-500 italic">No answer provided yet</p>
                    )}
                  </div>
                </div>
              </li>
            ))}
            
            {/* Then show any questions from plagiarism case */}
            {session.plagiarismCase?.studentQuestions && 
              session.plagiarismCase.studentQuestions.flatMap((studentQuestion, studentIndex) => 
                studentQuestion.questions.map((question, questionIndex) => (
                  <li key={`${studentQuestion.studentId}-${questionIndex}`} className="p-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-indigo-100 rounded-full p-2">
                        <span className="text-lg font-medium text-indigo-700">
                          {(session.questions?.length || 0) + studentIndex * studentQuestion.questions.length + questionIndex + 1}
                        </span>
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-md font-medium text-gray-900">{question.trim().replace(/^,\s*/, '')}</p>
                        <p className="mt-2 text-sm text-gray-500 italic">No answer provided yet</p>
                      </div>
                    </div>
                  </li>
                ))
              )
            }
            
            {(!session.questions || session.questions.length === 0) && 
             (!session.plagiarismCase?.studentQuestions || session.plagiarismCase.studentQuestions.length === 0) && (
              <li className="p-6">
                <p className="text-center text-gray-500">No questions available for this session.</p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
} 