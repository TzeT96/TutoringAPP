import { ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  // Check if we're on the student page or main page
  const isStudentPage = router.pathname.startsWith('/student');
  const isMainPage = router.pathname === '/';

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {isStudentPage ? (
            // No link for student pages
            <div className="flex items-center space-x-2 text-xl font-semibold text-gray-900">
              <img src="/images/logo.svg" alt="Tutoring App Logo" width={40} height={40} className="h-10 w-10" />
              <span>Tutoring App</span>
            </div>
          ) : (
            // Link for non-student pages
            <Link href="/" className="flex items-center space-x-2 text-xl font-semibold text-gray-900 hover:text-gray-700">
              <img src="/images/logo.svg" alt="Tutoring App Logo" width={40} height={40} className="h-10 w-10" />
              <span>Tutoring App</span>
            </Link>
          )}
        </nav>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
} 