import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">Welcome to Tutoring App</h1>
      
      <div className="w-full max-w-2xl">
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
      </div>
    </div>
  );
} 