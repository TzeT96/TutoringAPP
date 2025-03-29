import React from 'react';
import Link from 'next/link';

const SessionComplete = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-lg sm:p-20">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Session Complete!
            </h2>
            <p className="text-gray-600 mb-8">
              Thank you for completing your tutoring session. Your responses have been recorded.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionComplete; 