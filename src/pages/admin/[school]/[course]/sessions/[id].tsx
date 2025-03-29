import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/Layout_Courses';
import { Session as MockSession, StudentQuestions } from '@/data/mockData';

interface Answer {
  id: string;
  videoUrl: string | null;
  textAnswer: string | null;
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
  const { data: authSession, status } = useSession();
  const [session, setSession] = useState<TutoringSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newQuestion, setNewQuestion] = useState('');
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedQuestionText, setEditedQuestionText] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    if (!id) return;

    const fetchSession = async () => {
      try {
        const response = await fetch(`/api/admin/sessions/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch session');
        }
        const data = await response.json();
        setSession(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch session');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, [id, status, router]);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;

    setAddingQuestion(true);
    try {
      const response = await fetch(`/api/admin/sessions/${id}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newQuestion }),
      });

      if (!response.ok) {
        throw new Error('Failed to add question');
      }

      const data = await response.json();
      setSession(prev => prev ? {
        ...prev,
        questions: prev.questions ? [...prev.questions, data] : [data],
      } : null);
      setNewQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add question');
    } finally {
      setAddingQuestion(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
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
      setSession(updatedSession);
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
    return <div className="text-center p-4">Loading session...</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 p-4">{error}</div>;
  }

  if (!session) {
    return <div className="text-center p-4">Session not found</div>;
  }

  return (
    <AdminLayout>
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Session Details</h2>
          <div className="flex gap-2">
            {session.status === 'PENDING' && (
              <>
                <button
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Complete Session
                </button>
                <button
                  onClick={() => handleUpdateStatus('CANCELLED')}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Cancel Session
                </button>
              </>
            )}
            <button
              onClick={() => router.push('/admin/sessions')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Back to Sessions
            </button>
          </div>
        </div>

        <div className="mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Session Code</p>
              <p className="text-lg font-semibold">{session.code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-semibold">{session.status}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Created At</p>
              <p className="text-lg">{session.createdAt ? new Date(session.createdAt).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Started At</p>
              <p className="text-lg">{session.startedAt ? new Date(session.startedAt).toLocaleString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Verification Code</p>
              <p className="text-lg font-mono font-semibold text-blue-600">
                {session.verificationCode || 'No verification code assigned yet'}
              </p>
              {!session.verificationCode && (
                <button 
                  className="mt-2 px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => {
                    // In a real app, this would call an API to generate a code
                    alert('In a real app, this would generate a verification code for the session');
                  }}
                >
                  Generate Code
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Questions</h3>
          
          {session.status === 'PENDING' && (
            <form onSubmit={handleAddQuestion} className="mb-6">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="Enter a new question"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={addingQuestion}
                />
                <button
                  type="submit"
                  disabled={addingQuestion || !newQuestion.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {addingQuestion ? 'Adding...' : 'Add Question'}
                </button>
              </div>
            </form>
          )}

          {!session.plagiarismCase?.studentQuestions ? (
            <p className="text-gray-500">No questions available for this session.</p>
          ) : (
            <div className="space-y-4">
              {session.plagiarismCase.studentQuestions.flatMap((studentQuestion, studentIndex) => 
                studentQuestion.questions.map((question, questionIndex) => (
                  <div key={`${studentQuestion.studentId}-${questionIndex}`} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="w-full">
                        <span className="text-sm text-gray-500">
                          Question {questionIndex + 1} for {studentQuestion.studentName}
                        </span>
                        <p className="mt-1 text-gray-900">{question}</p>
                        <div className="mt-2 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            Math.random() > 0.5 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {Math.random() > 0.5 ? 'Answered' : 'Waiting for answer'}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => {
                            // For demo only - would normally open an edit form
                            alert(`Edit question: ${question}`);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="text-red-600 hover:text-red-800"
                          onClick={() => {
                            // For demo only
                            alert(`Delete question: ${question}`);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          
          {/* Video responses section */}
          <h3 className="text-lg font-semibold mt-8 mb-4">Video Responses</h3>
          
          {session.questions && session.questions.length > 0 ? (
            <div className="space-y-6">
              {session.questions.map((question) => (
                <div key={question.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="mb-2">
                    <h4 className="font-medium">Question: {question.text}</h4>
                    <p className="text-sm text-gray-500">Verification Code: {question.verificationCode.code}</p>
                  </div>
                  
                  {question.answer ? (
                    <div className="mt-4">
                      <div className="mb-2">
                        <h5 className="font-medium text-green-600">Answer submitted</h5>
                        <p className="text-sm text-gray-500">
                          Submitted at: {new Date(question.answer.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      
                      {question.answer.textAnswer && (
                        <div className="mb-4 p-3 bg-white rounded border">
                          <h6 className="text-sm font-medium mb-1">Text Answer:</h6>
                          <p className="text-gray-700">{question.answer.textAnswer}</p>
                        </div>
                      )}
                      
                      {question.answer.videoUrl ? (
                        <div className="mt-2">
                          <h6 className="text-sm font-medium mb-1">Video Response:</h6>
                          <video 
                            src={question.answer.videoUrl} 
                            controls 
                            className="max-w-full h-auto rounded"
                            preload="metadata"
                          />
                          <a 
                            href={question.answer.videoUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                          >
                            Open in new tab
                          </a>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No video response provided</p>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-yellow-600">Waiting for student response</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No video responses submitted yet.</p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
} 