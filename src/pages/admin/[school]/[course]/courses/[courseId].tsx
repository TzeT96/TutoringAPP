import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '@/components/Layout_Courses';
import { ExtendedCourse, getTeacherCourses } from '@/lib/admin-data-service';

const CourseDetailPage = () => {
  const router = useRouter();
  const { courseId } = router.query;
  const [course, setCourse] = useState<ExtendedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'assignments' | 'quizzes' | 'exams'>('all');
  const [plagiarismFilters, setPlagiarismFilters] = useState<Record<string, Set<string>>>({});
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Fetch course data
    const fetchCourseData = async () => {
      try {
        setLoading(true);
        
        // For demo purposes, we'll use a hardcoded teacher ID
        // In a real application, this would come from authentication
        const teacherId = "teacher1"; // Example ID
        
        // Get all courses for this teacher
        const teacherCourses = await getTeacherCourses(teacherId);
        
        // Find the specific course
        const foundCourse = teacherCourses.find(c => c.id === courseId);
        
        if (foundCourse) {
          setCourse(foundCourse);
        } else {
          setError('Course not found');
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError('Failed to load course data');
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseData();
    }
  }, [courseId]);

  const filteredAssignments = course?.assignments.filter(assignment => {
    if (activeTab === 'all') return true;
    if (activeTab === 'quizzes') return assignment.type === 'quiz';
    if (activeTab === 'assignments') return assignment.type === 'assignment';
    if (activeTab === 'exams') return assignment.type === 'exam';
    return false; // Shouldn't reach here
  }) || [];

  const getFilteredStudentResults = (assignmentId: string) => {
    if (!course) return [];
    
    const assignment = course.assignments.find(a => a.id === assignmentId);
    if (!assignment) return [];
    
    const statusFilters = plagiarismFilters[assignmentId] || new Set(['suspected', 'confirmed', 'cleared']);
    
    return assignment.studentResults.filter(result => statusFilters.has(result.plagiarismStatus));
  };

  const getPlagiarismStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-red-100 text-red-800';
      case 'suspected':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  const togglePlagiarismFilter = (assignmentId: string, status: string) => {
    setPlagiarismFilters(prev => {
      const currentFilters = prev[assignmentId] || new Set(['suspected', 'confirmed', 'cleared']);
      const newFilters = new Set(currentFilters);
      
      if (newFilters.has(status)) {
        newFilters.delete(status);
      } else {
        newFilters.add(status);
      }
      
      return {
        ...prev,
        [assignmentId]: newFilters
      };
    });
  };

  const toggleDropdown = (assignmentId: string) => {
    setDropdownOpen(prev => ({
      ...prev,
      [assignmentId]: !prev[assignmentId]
    }));
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

  if (error || !course) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error || 'Course not found'}</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{course.name}</h1>
            <p className="text-sm text-gray-500">{course.code} - {course.semester}</p>
          </div>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-indigo-500 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Students</dt>
                    <dd className="text-lg font-medium text-gray-900">{course.studentCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-red-500 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">High Risk Students</dt>
                    <dd className="text-lg font-medium text-gray-900">{course.highRiskCount}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-yellow-500 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Average Grade</dt>
                    <dd className="text-lg font-medium text-gray-900">{course.averageGrade}%</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Tabs */}
        <div className="bg-white shadow rounded-lg">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('all')}
                className={`${
                  activeTab === 'all'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center`}
              >
                All
                <span className="ml-2 bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs">
                  {course.assignments.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('assignments')}
                className={`${
                  activeTab === 'assignments'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center`}
              >
                Assignments
                <span className="ml-2 bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs">
                  {course.assignments.filter(a => a.type === 'assignment').length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('quizzes')}
                className={`${
                  activeTab === 'quizzes'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center`}
              >
                Quizzes
                <span className="ml-2 bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs">
                  {course.assignments.filter(a => a.type === 'quiz').length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('exams')}
                className={`${
                  activeTab === 'exams'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center`}
              >
                Exams
                <span className="ml-2 bg-gray-100 text-gray-900 px-2 py-0.5 rounded-full text-xs">
                  {course.assignments.filter(a => a.type === 'exam').length}
                </span>
              </button>
            </nav>
          </div>
          
          {/* Assignment List */}
          <div className="overflow-hidden">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No {activeTab !== 'all' ? activeTab : 'assignments'} found.</p>
              </div>
            ) : (
              filteredAssignments.map((assignment) => (
                <div key={assignment.id} className="border-b border-gray-200 last:border-b-0">
                  <div className="bg-gray-50 px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-medium leading-6 text-gray-900">
                            {assignment.title}
                          </h3>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            assignment.type === 'exam' ? 'bg-red-100 text-red-800' :
                            assignment.type === 'quiz' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {assignment.type}
                          </span>
                          <span className="text-sm text-gray-500">
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                          </span>
                          <span className="text-sm text-gray-500">
                            Points: {assignment.totalPoints}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Submission Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {getFilteredStudentResults(assignment.id).map((result) => {
                        const student = course.students.find((s: any) => s.id === result.studentId);
                        
                        return (
                          <tr key={result.studentId}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{result.studentName}</div>
                              <div className="text-sm text-gray-500">{student?.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{result.score} / {assignment.totalPoints}</div>
                              <div className="text-sm text-gray-500">
                                {Math.round((result.score / assignment.totalPoints) * 100)}%
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(result.submissionDate).toLocaleDateString()}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(result.submissionDate).toLocaleTimeString()}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CourseDetailPage; 