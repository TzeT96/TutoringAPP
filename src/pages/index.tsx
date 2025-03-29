import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function Home() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Welcome to Tutoring App</h1>
      
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Access Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Student Access</h2>
          <p className="text-gray-600 mb-6">Start your tutoring session here.</p>
          <Link 
            href="/student" 
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Student Portal
          </Link>
        </div>

        {/* Administrator Access Card */}
        <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 text-center">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Administrator Access</h2>
          <p className="text-gray-600 mb-6">Access the administrator dashboard.</p>
          {session?.user?.role !== 'admin' && (
            <Link 
              href="/auth/signin" 
              className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Sign in to Dashboard
            </Link>
          )}
        </div>
      </div>
    </div>
  );
} 