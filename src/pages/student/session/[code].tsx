import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

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
  sessionId?: string;
}

enum SessionState {
  PREPARING = 'preparing',
  READY = 'ready',
  RECORDING = 'recording',
  REVIEWING = 'reviewing',
  SUBMITTING = 'submitting',
  SUBMITTED = 'submitted'
}

interface SubmittedAnswer {
  question_id: string;
  text_answer?: string;
  video_url?: string;
  submitted_at: string;
}

export default function SessionPage() {
  const router = useRouter();
  const { code } = router.query;
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [recording, setRecording] = useState<MediaRecorder | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionState, setSessionState] = useState<SessionState>(SessionState.PREPARING);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [prepTime, setPrepTime] = useState(10);
  const [recordingTime, setRecordingTime] = useState(0);
  const [textAnswer, setTextAnswer] = useState('');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<SubmittedAnswer[]>([]);

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

  // Add useEffect to handle video element setup
  useEffect(() => {
    if (mediaStream && videoElement) {
      videoElement.srcObject = mediaStream;
      videoElement.autoplay = true;
      videoElement.muted = true;
      videoElement.playsInline = true;
    }

    return () => {
      if (videoElement) {
        videoElement.srcObject = null;
      }
    };
  }, [mediaStream, videoElement]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/questions/${code}`);
      const data: QuestionsResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch questions');
      }

      setQuestions(data.questions);
      setCurrentQuestion(data.currentQuestionIndex);
      
      // Store the full session ID from the API response
      const sessionId = data.sessionId || `session-1-student-${code}`;
      // Store the session ID for use in submissions
      localStorage.setItem('currentSessionId', sessionId);
      
      // If the session is complete, redirect to completion page
      if (data.isComplete) {
        router.push('/student/session-complete');
        return;
      }

      // If the current question has an answer, move to the next unanswered question
      if (data.questions[data.currentQuestionIndex]?.answer) {
        const nextUnansweredIndex = data.questions.findIndex(q => !q.answer);
        if (nextUnansweredIndex !== -1) {
          setCurrentQuestion(nextUnansweredIndex);
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching questions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      // Request camera and microphone permissions with simpler options
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      // Create MediaRecorder with default settings
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      // Store the media stream for cleanup
      setMediaStream(stream);
      setIsVideoReady(true);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        setRecordedBlob(blob);
        setRecordedVideoUrl(URL.createObjectURL(blob));
        setSessionState(SessionState.REVIEWING);
        setIsVideoReady(false);
      };

      // Request data every 1000ms (1 second)
      mediaRecorder.start(1000);
      setRecording(mediaRecorder);
      setSessionState(SessionState.RECORDING);
      setRecordingTime(0);
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording. Please check your camera permissions.');
      setIsVideoReady(false);
    }
  };

  const stopRecording = () => {
    recording?.stop();
    setRecording(null);
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
      setMediaStream(null);
    }
    // Clean up the preview URL
    if (videoPreviewUrl) {
      URL.revokeObjectURL(videoPreviewUrl);
      setVideoPreviewUrl(null);
    }
    setIsVideoReady(false);
  };

  // Cleanup function for video URLs
  useEffect(() => {
    return () => {
      if (videoPreviewUrl) {
        URL.revokeObjectURL(videoPreviewUrl);
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
    };
  }, [videoPreviewUrl, recordedVideoUrl]);

  /**
   * Production-ready answer submission function with robust error handling
   * and better user feedback
   */
  const submitAnswer = async () => {
    if (!recordedBlob && !textAnswer) {
      setError('Please record a video or provide a text answer');
      return;
    }

    setIsSubmitting(true);
    setSubmissionMessage('Preparing submission...');
    setError('');

    try {
      // Get the stored session ID rather than using the code
      const sessionId = localStorage.getItem('currentSessionId') || '';
      if (!sessionId) {
        throw new Error('Session ID not found. Please refresh the page and try again.');
      }
      
      // Basic request data
      const requestData: {
        sessionId: string;
        questionId: string;
        textAnswer: string | null;
        videoBlob?: string;
      } = {
        sessionId,
        questionId: questions[currentQuestion].id,
        textAnswer: textAnswer || null,
      };

      // Fix any duplicate "student-student-" patterns in questionId
      if (requestData.questionId.includes('student-student-')) {
        requestData.questionId = requestData.questionId.replace('student-student-', 'student-');
        console.log('Fixed duplicate student prefix in question ID:', requestData.questionId);
      }

      // Process video if available
      if (recordedBlob) {
        setSubmissionMessage('Processing video...');
        
        try {
          // Optimize video before sending
          const optimizedBlob = await optimizeVideo(recordedBlob);
          
          // Convert blob to data URL
          const reader = new FileReader();
          const dataUrlPromise = new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(optimizedBlob);
          });
          
          const dataUrl = await dataUrlPromise;
          requestData.videoBlob = dataUrl;
          
          setSubmissionMessage('Uploading submission...');
        } catch (videoError) {
          console.error('Video processing error:', videoError);
          if (!textAnswer) {
            setError(videoError instanceof Error ? videoError.message : 'Failed to process video. Please try again or provide a text answer.');
            setIsSubmitting(false);
            return;
          }
          // Continue with text-only if we have it
        }
      }
      
      // Submit the answer
      const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
        const controller = new AbortController();
        const { signal } = controller;
        
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        try {
          const response = await fetch(url, { ...options, signal });
          clearTimeout(timeoutId);
          return response;
        } catch (error: any) {
          clearTimeout(timeoutId);
          // DOMException: The operation was aborted
          if (error.name === 'AbortError') {
            throw new Error('The request took too long to complete. Please try submitting a shorter video or just the text answer.');
          }
          throw error;
        }
      };

      const response = await fetchWithTimeout(
        '/api/student/session/submit-answer',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestData),
        },
        60000 // 60 second timeout (increased from 30 seconds)
      );
      
      if (!response.ok) {
        // Handle error response
        const errorText = await response.text();
        let errorMessage;
        
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.error || 'Failed to submit answer';
        } catch (e) {
          errorMessage = errorText || `Server error: ${response.status}`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Handle success
      setSubmissionMessage('Answer submitted successfully!');
      
      // Move to next question or finish
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(prev => prev + 1);
        setRecordedBlob(null);
        setTextAnswer('');
        if (recordedVideoUrl) {
          URL.revokeObjectURL(recordedVideoUrl);
          setRecordedVideoUrl(null);
        }
        setSessionState(SessionState.PREPARING);
        setPrepTime(10);
        setIsSubmitting(false);
      } else {
        setSessionState(SessionState.SUBMITTED);
        router.push('/student/session-complete');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsSubmitting(false);
      setSessionState(SessionState.REVIEWING);
    }
  };

  // Helper function to format time
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Add this right before the return statement to properly show submission state
  const renderSubmitButton = () => {
    if (isSubmitting) {
      return (
        <button
          disabled
          className="w-full px-4 py-2 bg-gray-400 text-white rounded-md"
        >
          <span className="inline-block mr-2 w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          Submitting...
        </button>
      );
    }
    
    if (sessionState === SessionState.REVIEWING) {
      return (
        <button
          onClick={submitAnswer}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Submit Answer
        </button>
      );
    }
    
    return null;
  };

  // Helper function to optimize video by reducing resolution and bitrate
  async function optimizeVideo(videoBlob: Blob): Promise<Blob> {
    // If video is small enough already, just return it
    if (videoBlob.size < 2 * 1024 * 1024) { // Less than 2MB
      console.log('Video already small enough, skipping optimization');
      return videoBlob;
    }
    
    return new Promise((resolve, reject) => {
      try {
        // Create video element to load the blob
        const video = document.createElement('video');
        video.autoplay = false;
        video.muted = true;
        video.playsInline = true;
        
        // Create object URL for the blob
        const videoURL = URL.createObjectURL(videoBlob);
        video.src = videoURL;
        
        // Set up video to start processing once loaded
        video.onloadedmetadata = () => {
          // Create canvas for processing
          const canvas = document.createElement('canvas');
          // Downscale to 640x360 (360p) for smaller file size
          const targetWidth = 640;
          const targetHeight = 360;
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(videoURL);
            return reject(new Error('Failed to get canvas context'));
          }
          
          // Set up recording with lower bitrate
          const stream = canvas.captureStream(15); // 15fps
          const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 500000 // 500kbps
          });
          
          const chunks: BlobPart[] = [];
          recorder.ondataavailable = (e) => {
            if (e.data.size > 0) {
              chunks.push(e.data);
            }
          };
          
          recorder.onstop = () => {
            URL.revokeObjectURL(videoURL);
            const optimizedBlob = new Blob(chunks, { type: 'video/webm' });
            console.log(`Video optimized: ${videoBlob.size} -> ${optimizedBlob.size} bytes`);
            resolve(optimizedBlob);
          };
          
          // Start recording
          recorder.start();
          
          // Play video and draw frames to canvas
          let currentTime = 0;
          const videoDuration = video.duration;
          const drawFrame = () => {
            if (currentTime < videoDuration) {
              video.currentTime = currentTime;
              
              // Wait for seeked event before drawing the frame
              video.onseeked = () => {
                // Draw the current frame onto the canvas
                ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
                
                // Move to next frame
                currentTime += 1/15; // 15fps
                
                // Continue with the next frame
                if (currentTime < videoDuration) {
                  drawFrame();
                } else {
                  // We're done
                  recorder.stop();
                  video.onseeked = null;
                }
              };
            } else {
              recorder.stop();
            }
          };
          
          // Start the frame drawing process
          drawFrame();
        };
        
        // Handle loading errors
        video.onerror = () => {
          URL.revokeObjectURL(videoURL);
          reject(new Error('Failed to load video for optimization'));
        };
        
      } catch (err) {
        console.error('Error during video optimization:', err);
        // If optimization fails, return original blob
        resolve(videoBlob);
      }
    });
  }

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

  const submittedAnswer = submittedAnswers.find(
    answer => answer.question_id === currentQuestionData.id
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Question and Answer */}
            <div className="lg:col-span-2 space-y-8">
              {/* Question Display */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Question {currentQuestion + 1} of {questions.length}</h2>
                <p className="text-gray-700">{currentQuestionData.text}</p>
              </div>

              {/* Text Answer Input */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium mb-4">Write Down Your Answer Here</h3>
                <textarea
                  value={textAnswer}
                  onChange={(e) => setTextAnswer(e.target.value)}
                  placeholder="Write your answer here..."
                  className="w-full h-32 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={sessionState === SessionState.SUBMITTING}
                />
              </div>

              {/* Submission Status */}
              <div className="mt-6">
                {renderSubmitButton()}
                {error && (
                  <div className="mt-2 p-2 bg-red-100 text-red-700 text-sm rounded">
                    {error}
                  </div>
                )}
                {submissionMessage && !error && (
                  <div className="mt-2 p-2 bg-blue-100 text-blue-700 text-sm rounded">
                    {submissionMessage}
                  </div>
                )}
              </div>

              {submittedAnswer && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold mb-2">Your submitted answer:</h3>
                  
                  {submittedAnswer.text_answer && (
                    <p className="mb-2">{submittedAnswer.text_answer}</p>
                  )}
                  
                  {submittedAnswer.video_url && (
                    <div className="mt-2">
                      <video
                        controls
                        width="100%"
                        src={submittedAnswer.video_url}
                        className="rounded-lg"
                      />
                    </div>
                  )}
                  
                  <p className="text-xs text-gray-500 mt-2">
                    Submitted on {new Date(submittedAnswer.submitted_at).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {/* Right Column - Video Preview */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-6 sticky top-8">
                <div className="space-y-4">
                  {/* Video Preview */}
                  <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
                    {sessionState === SessionState.RECORDING ? (
                      <video
                        ref={setVideoElement}
                        className="w-full h-full object-cover"
                      />
                    ) : (sessionState === SessionState.REVIEWING && recordedVideoUrl) ? (
                      <video
                        src={recordedVideoUrl}
                        controls
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        {sessionState === SessionState.PREPARING ? (
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-2">{prepTime}</div>
                            <div className="text-sm">Get ready...</div>
                          </div>
                        ) : sessionState === SessionState.READY ? (
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-2">Ready to Record</div>
                            <div className="text-sm">Click Start Recording when you're ready</div>
                          </div>
                        ) : sessionState === SessionState.REVIEWING ? (
                          <div className="text-center">
                            <div className="text-2xl font-bold mb-2">Review</div>
                            <div className="text-sm">Review your recording before submitting</div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {/* Recording Controls */}
                  <div className="flex justify-center space-x-4">
                    {sessionState === SessionState.READY && (
                      <button
                        onClick={startRecording}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Start Recording
                      </button>
                    )}
                    {sessionState === SessionState.RECORDING && (
                      <button
                        onClick={stopRecording}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                      >
                        Stop Recording
                      </button>
                    )}
                  </div>

                  {/* Video Status */}
                  <div className="flex items-center justify-center space-x-2 text-sm">
                    {sessionState === SessionState.RECORDING && (
                      <div className="flex items-center text-red-600">
                        <div className="w-2 h-2 bg-red-600 rounded-full mr-2 animate-pulse"></div>
                        Recording in progress
                      </div>
                    )}
                    {sessionState === SessionState.REVIEWING && (
                      <div className="flex items-center text-green-600">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        Recording ready for review
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 