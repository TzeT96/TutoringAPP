import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  HomeIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  CogIcon,
  MagnifyingGlassIcon as SearchIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [courseData, setCourseData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get the current school and course from the URL
  const currentSchool = router.query.school?.toString() || '';
  const currentCourse = router.query.course?.toString() || '';

  // Construct the base path for course-specific navigation
  const courseBasePath = `/admin/${currentSchool}/${currentCourse}`;

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!router.isReady || !currentSchool || !currentCourse) return;

      try {
        setLoading(true);
        // Normalize the URL parameters
        const normalizedSchool = currentSchool.toUpperCase();
        const normalizedCourse = currentCourse.replace(/\s+/g, '').toUpperCase();
        
        const response = await fetch(`/api/courses/${normalizedSchool}/${normalizedCourse}`);
        
        if (!response.ok) {
          throw new Error('Course not found');
        }

        const data = await response.json();
        setCourseData(data);
        setError('');

        // Update the URL to use the normalized values if they're different
        if (currentSchool !== normalizedSchool || currentCourse !== normalizedCourse) {
          router.replace(`/admin/${normalizedSchool}/${normalizedCourse}`, undefined, { shallow: true });
        }
      } catch (err) {
        setError('This course does not exist');
        console.error('Error fetching course data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [router.isReady, currentSchool, currentCourse]);

  const navigation = [
    { name: 'Summary', href: courseBasePath, icon: HomeIcon },
    { name: 'Sessions', href: `${courseBasePath}/sessions`, icon: UserGroupIcon },
    { name: 'Analytics', href: `${courseBasePath}/analytics`, icon: ChartBarIcon },
    { name: 'Course Settings', href: `${courseBasePath}/settings`, icon: CogIcon },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Implement search functionality
    console.log('Searching for:', searchQuery);
  };

  // Helper function to check if a path is active
  const isPathActive = (path: string) => {
    if (!router.pathname) return false;
    
    // For the summary page, we want exact match
    if (path === courseBasePath) {
      return router.pathname === path;
    }
    
    // For other pages, we want to check if the current path starts with the navigation path
    return router.pathname.startsWith(path);
  };

  // Helper function to handle navigation
  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    router.push(href);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <a
                  href={courseBasePath}
                  onClick={(e) => handleNavigation(e, courseBasePath)}
                  className="flex items-center"
                >
                  <span className="text-xl font-bold text-indigo-600">Tutoring Admin</span>
                </a>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => {
                  const isActive = isPathActive(item.href);
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      onClick={(e) => handleNavigation(e, item.href)}
                      className={`${
                        isActive
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <item.icon className="h-5 w-5 mr-1" />
                      {item.name}
                    </a>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              {/* Global Search */}
              <form onSubmit={handleSearch} className="flex-1 max-w-lg px-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search within this course..."
                  />
                </div>
              </form>
              {/* Notifications */}
              <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <BellIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout; 