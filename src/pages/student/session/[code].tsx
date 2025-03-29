import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';

interface Question {
  id: string;
  text: string;
  answer: {
    id: string;
    videoUrl: string;
    textAnswer: string | null;
  } | null;
}

interface QuestionsResponse {
  questions: Question[];
  currentQuestionIndex: number;
  isComplete: boolean;
  message?: string;
}

enum SessionState {
  PREPARING = 'preparing',
  READY = 'ready',
  RECORDING = 'recording',
  REVIEWING = 'reviewing',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

export default function SessionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { code } = router.query;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [recording, setRecording] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.PREPARING);
  const [prepTime, setPrepTime] = useState(10);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textAnswer, setTextAnswer] = useState('');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState('');

  // Wait for router to be ready before fetching questions
  useEffect(() => {
    if (!router.isReady) return;
    
    if (!code) {
      setError('No verification code provided');
      setLoading(false);
      return;
    }

    fetchQuestions();
  }, [router.isReady, code]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState === SessionState.PREPARING && prepTime > 0) {
      timer = setTimeout(() => {
        setPrepTime(prev => prev - 1);
      }, 1000);
    } else if (sessionState === SessionState.PREPARING && prepTime === 0) {
      setSessionState(SessionState.READY);
    }
    return () => clearTimeout(timer);
  }, [prepTime, sessionState]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sessionState === SessionState.RECORDING) {
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionState]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/questions/${code}`);
      const data: QuestionsResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch questions');
      }

      setQuestions(data.questions);
      setCurrentQuestion(data.currentQuestionIndex);
      
      // If the session is complete, redirect to completion page
      if (data.isComplete) {
        router.push('/student/session-complete');
        return;
      }

      // If the current question has an answer, move to the next unanswered question
      if (data.questions[data.currentQuestionIndex]?.answer) {
        const nextUnansweredIndex = data.questions.findIndex((q, index) => index > data.currentQuestionIndex && !q.answer);
        if (nextUnansweredIndex !== -1) {
          setCurrentQuestion(nextUnansweredIndex);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setSessionState(SessionState.REVIEWING);
      };

      mediaRecorder.start();
      setRecording(mediaRecorder);
      setSessionState(SessionState.RECORDING);
      setRecordingTime(0);
    } catch (err) {
      setError('Failed to start recording. Please check your camera permissions.');
    }
  };

  const stopRecording = () => {
    recording?.stop();
    setRecording(null);
    const tracks = recording?.stream.getTracks();
    tracks?.forEach(track => track.stop());
  };

  const submitAnswer = async () => {
    if (!recordedBlob && sessionState === SessionState.REVIEWING) {
      setError('No recording available');
      return;
    }

    setSessionState(SessionState.SUBMITTING);
    setSubmissionMessage('Submitting your answer...');
    setError('');

    try {
      // First, submit the text answer
      const response = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: questions[currentQuestion].id,
          code: code as string,
          textAnswer: textAnswer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit answer');
      }

      let videoUrl = null;
      
      // If we have a video recording, upload it
      if (recordedBlob) {
        setSubmissionMessage('Uploading video recording...');
        
        try {
          // Convert blob to base64
          const reader = new FileReader();
          const base64Promise = new Promise<string>((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(recordedBlob);
          });
          
          const base64Data = await base64Promise;
          
          // Upload video to S3
          const videoResponse = await fetch('/api/upload-video', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              sessionId: data.answer.sessionId,
              questionId: data.answer.questionId,
              videoBlob: base64Data,
            }),
          });
          
          if (!videoResponse.ok) {
            console.error('Failed to upload video, but text answer was submitted');
          } else {
            const videoData = await videoResponse.json();
            videoUrl = videoData.videoUrl;
          }
        } catch (videoError) {
          console.error('Error uploading video:', videoError);
          // Continue with the process even if video upload fails
        }
      }

      // Refresh the questions data to get the updated answer status
      await fetchQuestions();
      
      // Update the local state to mark this question as answered
      const updatedQuestions = [...questions];
      updatedQuestions[currentQuestion] = {
        ...updatedQuestions[currentQuestion],
        answer: {
          id: data.answer.id,
          videoUrl: videoUrl || null,
          textAnswer: textAnswer || null
        }
      };
      setQuestions(updatedQuestions);

      setSessionState(SessionState.SUBMITTED);
      
      // If this was the last question in the sequence, try to complete the session
      if (currentQuestion === questions.length - 1) {
        setSubmissionMessage('Completing session...');
        
        try {
          const completeResponse = await fetch('/api/complete-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (completeResponse.ok) {
            // Session completed successfully
            setSubmissionMessage('Thanks for joining the tutoring session!');
            await new Promise(resolve => setTimeout(resolve, 2000));
            router.push('/student/session-complete');
            return;
          }
        } catch (completeError) {
          console.error('Error completing session:', completeError);
          // If session completion fails, we'll just continue to the next question
        }
      }
      
      // Find next unanswered question, or move to the next question in sequence
      const nextUnansweredIndex = updatedQuestions.findIndex(q => !q.answer);
      if (nextUnansweredIndex !== -1) {
        setSubmissionMessage('Answer submitted successfully! Moving to the next unanswered question in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentQuestion(nextUnansweredIndex);
      } else {
        // Move to next question in sequence
        const nextQuestion = (currentQuestion + 1) % questions.length;
        setSubmissionMessage('Answer submitted successfully! Moving to next question in 2 seconds...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        setCurrentQuestion(nextQuestion);
      }

      // Reset for next question
      setSessionState(SessionState.PREPARING);
      setPrepTime(10);
      setTextAnswer('');
      setRecordedBlob(null);
      setSubmissionMessage('');
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit answer');
      setSessionState(SessionState.REVIEWING);
    }
  };

  const retryRecording = () => {
    setSessionState(SessionState.READY);
    setRecordedBlob(null);
    setRecordingTime(0);
    setError('');
  };

  // Helper function to format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600 p-4">
          <p className="text-xl font-semibold mb-4">Error</p>
          <p>No verification code provided</p>
          <button
            onClick={() => router.push('/student')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Start
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-600 p-4">
          <p className="text-xl font-semibold mb-4">Error</p>
          <p>{error}</p>
          <button
            onClick={() => router.push('/student')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Start
          </button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <p className="text-xl font-semibold mb-4">No Questions Available</p>
          <p>No questions found for this session.</p>
          <button
            onClick={() => router.push('/student')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Return to Start
          </button>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  if (!currentQuestionData) {
    router.push('/student/session-complete');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Completing session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Question {currentQuestion + 1} of {questions.length}</h1>
        <p className="text-lg mb-4">{currentQuestionData.text}</p>
        
        {sessionState === SessionState.PREPARING && (
          <div className="text-center p-4 bg-blue-50 rounded-lg mb-4">
            <p className="text-lg font-semibold">Preparation Time</p>
            <p className="text-3xl font-bold text-blue-600">{prepTime} seconds</p>
          </div>
        )}

        {sessionState === SessionState.RECORDING && (
          <div className="text-center p-4 bg-red-50 rounded-lg mb-4">
            <p className="text-lg font-semibold">Recording Time</p>
            <p className="text-3xl font-bold text-red-600">{formatTime(recordingTime)}</p>
          </div>
        )}

        {(sessionState === SessionState.SUBMITTING || sessionState === SessionState.SUBMITTED) && (
          <div className={`text-center p-4 ${
            error ? 'bg-red-50' : 'bg-green-50'
          } rounded-lg mb-4`}>
            <p className="text-lg font-semibold">{submissionMessage}</p>
          </div>
        )}

        <div className="space-y-4">
          {(sessionState === SessionState.RECORDING || sessionState === SessionState.REVIEWING) && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Written Answer (Optional)
              </label>
              <textarea
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Type your answer here..."
                disabled={sessionState !== SessionState.RECORDING}
              />
            </div>
          )}

          {sessionState === SessionState.READY && (
            <button
              onClick={startRecording}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Start
            </button>
          )}

          {sessionState === SessionState.RECORDING && (
            <button
              onClick={stopRecording}
              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              Stop Recording
            </button>
          )}

          {sessionState === SessionState.REVIEWING && (
            <div className="space-y-4">
              <div className="text-center p-2 bg-gray-50 rounded-lg mb-4">
                <p className="text-sm text-gray-600">Recording length: {formatTime(recordingTime)}</p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={retryRecording}
                  className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Record Again
                </button>
                <button
                  onClick={submitAnswer}
                  className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Submit Answer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 