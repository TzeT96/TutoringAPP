import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function SessionCompletePage() {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Set up countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          // Close the window after countdown reaches 0
          window.close();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Session Complete
          </h2>
          <div className="mt-8 space-y-6">
            <div className="rounded-md bg-green-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-green-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    Thanks for joining the tutoring session!
                  </p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Your answers have been submitted successfully. The tutor will review your responses.
            </p>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                This window will close automatically in {countdown} seconds.
              </p>
              <button
                onClick={() => window.close()}
                className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Close Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 