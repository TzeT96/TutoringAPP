import React, { useState, useEffect } from 'react';
import Layout_Courses from '@/components/Layout_Courses';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Global styles for dropdown animations
const globalStyles = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  .dropdown-container {
    position: relative;
  }
`;

interface CourseData {
  id: string;
  name: string;
  code: string;
  school: string;
  semester: string;
  studentCount: number;
  highRiskCount: number;
  averageGrade: number;
  assignments: {
    id: string;
    title: string;
    type: string;
    dueDate: Date;
    totalPoints: number;
    studentResults: {
      studentId: string;
      studentName: string;
      studentEmail: string;
      score: number;
      submissionDate: Date;
      plagiarismStatus: string;
      similarityScore: number;
      requiresVerification: boolean;
      verificationQuestions?: string[];
      canvasUrl?: string;
    }[];
  }[];
  students: {
    id: string;
    name: string;
    email: string;
  }[];
}

const CourseDashboard = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [expandedAssignments, setExpandedAssignments] = useState<Record<string, boolean>>({});
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({});
  const [plagiarismFilters, setPlagiarismFilters] = useState<Record<string, Set<string>>>({});
  const [dropdownOpen, setDropdownOpen] = useState<Record<string, boolean>>({});
  const STUDENTS_PER_PAGE = 8;

  useEffect(() => {
    const fetchData = async () => {
      if (!router.isReady || !router.query.school || !router.query.course) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/courses/${router.query.school}/${router.query.course}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || errorData.error || 'Failed to fetch course data');
        }

        const data = await response.json();
        setCourseData(data);
        setError('');
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router.isReady, router.query.school, router.query.course]);

  // Chart data setup
  const chartData = {
    labels: courseData ? [courseData.code] : [],
    datasets: [
      {
        label: 'Total Submissions',
        data: courseData ? [
          courseData.assignments.reduce((sum, assignment) => 
            sum + (assignment.studentResults?.length || 0), 0)
        ] : [],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
      {
        label: 'High Risk Submissions',
        data: courseData ? [
          courseData.highRiskCount
        ] : [],
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Plagiarism Detection Overview',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Submissions'
        }
      },
    },
  };

  const handleSendEmail = (studentsToEmail: any[], assignment?: any) => {
    setSelectedStudents(studentsToEmail);
    setSelectedAssignment(assignment || null);
    
    const assignmentInfo = assignment ? 
      `regarding your submission for the ${assignment.title} ${assignment.type}` : 
      'regarding your recent submission';
    
    setEmailTemplate(`Dear student,

We have reviewed ${assignmentInfo} and would like to discuss it with you in a tutoring session.

Please use the following verification code to access your tutoring session:
{verificationCode}

Best regards,
${session?.user?.name || 'Your Tutor'}`);
    
    setEmailDialogOpen(true);
  };

  const handleConfirmSendEmail = async () => {
    try {
      // TODO: Implement email sending functionality
      console.log('Sending emails to:', selectedStudents);
      setEmailDialogOpen(false);
    } catch (error) {
      console.error('Error sending emails:', error);
    }
  };

  const handleViewReport = (studentEmail: string, assignmentId: string) => {
    window.open(`/report/${assignmentId}/${encodeURIComponent(studentEmail)}`, '_blank');
  };

  const getFilteredStudentResults = (assignmentId: string) => {
    if (!courseData) return [];
    const assignment = courseData.assignments.find(a => a.id === assignmentId);
    if (!assignment || !assignment.studentResults) return [];

    return assignment.studentResults.filter(result => {
      const filters = plagiarismFilters[assignmentId];
      return !filters || filters.size === 0 || filters.has(result.plagiarismStatus);
    });
  };

  const getSuspectedStudents = (assignmentId: string): any[] => {
    if (!courseData) return [];
    const assignment = courseData.assignments.find(a => a.id === assignmentId);
    if (!assignment) return [];

    return assignment.studentResults.filter(result => 
      result.plagiarismStatus === 'suspected' || result.plagiarismStatus === 'confirmed'
    );
  };

  const getPaginatedStudentResults = (assignmentId: string) => {
    const key = assignmentId;
    const currentPage = currentPages[key] || 1;
    const filteredResults = getFilteredStudentResults(assignmentId);
    const startIndex = (currentPage - 1) * STUDENTS_PER_PAGE;
    const endIndex = startIndex + STUDENTS_PER_PAGE;
    return filteredResults.slice(startIndex, endIndex);
  };

  const getTotalPages = (assignmentId: string) => {
    const filteredResults = getFilteredStudentResults(assignmentId);
    return Math.ceil(filteredResults.length / STUDENTS_PER_PAGE);
  };

  const changePage = (assignmentId: string, page: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [assignmentId]: page
    }));
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

  const toggleAssignmentExpand = (assignmentId: string) => {
    setExpandedAssignments(prev => {
      const newExpanded = { ...prev, [assignmentId]: !prev[assignmentId] };
      
      // If we're collapsing this assignment, also close any open dropdowns
      if (!newExpanded[assignmentId]) {
        setDropdownOpen(prev => ({
          ...prev,
          [assignmentId]: false
        }));
      }
      
      return newExpanded;
    });
    
    // Initialize the current page for this assignment if it's not already set
    if (!currentPages[assignmentId] && !expandedAssignments[assignmentId]) {
      setCurrentPages(prev => ({
        ...prev,
        [assignmentId]: 1
      }));
    }
  };

  if (loading) {
    return (
      <Layout_Courses>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout_Courses>
    );
  }

  if (error) {
    return (
      <Layout_Courses>
        <div className="flex flex-col items-center justify-center h-64">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <Link href="/admin" className="text-indigo-600 hover:text-indigo-800">
            Return to Dashboard
          </Link>
        </div>
      </Layout_Courses>
    );
  }

  return (
    <Layout_Courses>
      <div className="space-y-6">
        {/* Course Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">Cheating Detection Dashboard</h1>
          {session?.user && (
            <div className="bg-white px-4 py-2 rounded-lg shadow border border-gray-200">
              <span className="text-sm font-medium text-gray-500">Logged in as:</span>
              <span className="ml-2 text-sm font-semibold">{session.user.name || session.user.email}</span>
            </div>
          )}
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-md bg-indigo-500 p-3">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Submissions</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {courseData?.assignments.reduce((sum, assignment) => 
                        sum + assignment.studentResults.length, 0) || 0}
                    </dd>
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
                    <dt className="text-sm font-medium text-gray-500 truncate">High Risk Submissions</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {courseData?.highRiskCount || 0}
                    </dd>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Verification Required</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {courseData?.assignments.reduce((sum, assignment) => 
                        sum + assignment.studentResults.filter(r => r.requiresVerification).length, 0) || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        {courseData && (
          <div className="bg-white p-6 shadow rounded-lg">
            <Bar options={chartOptions} data={chartData} height={80} />
          </div>
        )}

        {/* Assignment List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Plagiarism Status</h2>
            <p className="mt-1 text-sm text-gray-500">View suspected plagiarism across all assignments.</p>
          </div>
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
                  {courseData?.assignments.length || 0}
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
                  {courseData?.assignments.filter(a => a.type.toLowerCase() === 'assignment').length || 0}
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
                  {courseData?.assignments.filter(a => a.type.toLowerCase() === 'quiz').length || 0}
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
                  {courseData?.assignments.filter(a => a.type.toLowerCase() === 'exam').length || 0}
                </span>
              </button>
            </nav>
          </div>
          
          {/* Assignment List */}
          <div className="overflow-hidden">
            {!courseData || courseData.assignments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No assignments found.</p>
              </div>
            ) : (
              courseData.assignments
                .filter(assignment => {
                  if (activeTab === 'all') return true;
                  if (activeTab === 'quizzes') return assignment.type.toLowerCase() === 'quiz';
                  if (activeTab === 'assignments') return assignment.type.toLowerCase() === 'assignment';
                  if (activeTab === 'exams') return assignment.type.toLowerCase() === 'exam';
                  return false;
                })
                .map((assignment) => (
                  <div key={assignment.id} className="border-b border-gray-200 last:border-b-0">
                    <div 
                      className="bg-gray-50 px-4 py-4 sm:px-6 cursor-pointer hover:bg-gray-100"
                      onClick={() => toggleAssignmentExpand(assignment.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                            <svg 
                              className={`h-5 w-5 mr-2 transition-transform ${expandedAssignments[assignment.id] ? 'transform rotate-90' : ''}`} 
                              fill="none" 
                              viewBox="0 0 24 24" 
                              stroke="currentColor"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                            {assignment.title}
                          </h3>
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
                        <div className="flex items-center">
                          {/* Send email button */}
                          <div className="relative mr-3">
                            <div className="flex justify-end mb-2">
                              {!expandedAssignments[assignment.id] && (
                                <span className="text-xs text-gray-500 mr-2 inline-flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                  Expand to enable
                                </span>
                              )}
                              <div className="relative inline-block text-left dropdown-container">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (expandedAssignments[assignment.id]) {
                                      toggleDropdown(assignment.id);
                                    }
                                  }}
                                  className={`inline-flex justify-center items-center gap-1 rounded-md border ${expandedAssignments[assignment.id] ? 'border-indigo-300 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700' : 'border-gray-300 bg-white text-gray-400 cursor-not-allowed'} shadow-sm px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200`}
                                  aria-haspopup="true"
                                  aria-expanded={dropdownOpen[assignment.id] ? "true" : "false"}
                                  disabled={!expandedAssignments[assignment.id]}
                                  title={expandedAssignments[assignment.id] ? "Send emails to students" : "Expand the assignment to enable sending emails"}
                                >
                                  <span>Send Email ({getSuspectedStudents(assignment.id).length})</span>
                                  <svg className={`w-4 h-4 ml-1 transition-transform ${dropdownOpen[assignment.id] ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                                {dropdownOpen[assignment.id] && expandedAssignments[assignment.id] && (
                                  <>
                                    <div 
                                      className="fixed inset-0 z-40" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDropdown(assignment.id);
                                      }}
                                    />
                                    <div 
                                      className="absolute rounded-lg shadow-xl bg-white z-50"
                                      onClick={(e) => e.stopPropagation()}
                                      style={{ 
                                        right: '0',
                                        top: '100%',
                                        marginTop: '10px',
                                        width: '320px',
                                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                        animation: 'fadeIn 0.2s ease-out'
                                      }}
                                    >
                                      <div className="py-4 px-4 bg-white rounded-lg">
                                        <div className="text-sm font-bold text-gray-700 mb-3 border-b pb-2 border-gray-200">
                                          Filter by plagiarism status:
                                        </div>
                                        <div className="space-y-3">
                                          <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                              <input
                                                id={`suspected-${assignment.id}`}
                                                type="checkbox"
                                                className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
                                                checked={(plagiarismFilters[assignment.id] || new Set(['suspected', 'confirmed', 'cleared'])).has('suspected')}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  togglePlagiarismFilter(assignment.id, 'suspected');
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                              />
                                            </div>
                                            <div className="ml-3 text-sm">
                                              <label htmlFor={`suspected-${assignment.id}`} className="font-medium text-gray-700">
                                                Suspected
                                              </label>
                                            </div>
                                          </div>
                                          <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                              <input
                                                id={`confirmed-${assignment.id}`}
                                                type="checkbox"
                                                className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
                                                checked={(plagiarismFilters[assignment.id] || new Set(['suspected', 'confirmed', 'cleared'])).has('confirmed')}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  togglePlagiarismFilter(assignment.id, 'confirmed');
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                              />
                                            </div>
                                            <div className="ml-3 text-sm">
                                              <label htmlFor={`confirmed-${assignment.id}`} className="font-medium text-gray-700">
                                                Confirmed
                                              </label>
                                            </div>
                                          </div>
                                          <div className="flex items-start">
                                            <div className="flex items-center h-5">
                                              <input
                                                id={`cleared-${assignment.id}`}
                                                type="checkbox"
                                                className="focus:ring-indigo-500 h-5 w-5 text-indigo-600 border-gray-300 rounded"
                                                checked={(plagiarismFilters[assignment.id] || new Set(['suspected', 'confirmed', 'cleared'])).has('cleared')}
                                                onChange={(e) => {
                                                  e.stopPropagation();
                                                  togglePlagiarismFilter(assignment.id, 'cleared');
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                              />
                                            </div>
                                            <div className="ml-3 text-sm">
                                              <label htmlFor={`cleared-${assignment.id}`} className="font-medium text-gray-700">
                                                Cleared
                                              </label>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="mt-5 pt-3 border-t border-gray-200">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const students = getSuspectedStudents(assignment.id);
                                              handleSendEmail(students, assignment);
                                              toggleDropdown(assignment.id);
                                            }}
                                            disabled={getSuspectedStudents(assignment.id).length === 0}
                                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-base font-medium text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            Apply & Send{getSuspectedStudents(assignment.id).length > 0 ? ` (${getSuspectedStudents(assignment.id).length})` : ' (0)'}
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            assignment.studentResults.filter(r => r.plagiarismStatus !== 'cleared').length > 0 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {assignment.studentResults.filter(r => r.plagiarismStatus !== 'cleared').length} flagged
                          </span>
                        </div>
                      </div>
                    </div>
                    {expandedAssignments[assignment.id] && (
                      <div onClick={(e) => e.stopPropagation()}>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Student
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AI Status
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                AI Score
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tutoring Session
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tutoring Result
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {getPaginatedStudentResults(assignment.id).map((result) => (
                              <tr key={result.studentId} className={result.plagiarismStatus !== 'cleared' ? 'bg-red-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{result.studentName}</div>
                                  <div className="text-sm text-gray-500">{result.studentEmail}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    result.plagiarismStatus === 'confirmed' ? 'bg-red-100 text-red-800' :
                                    result.plagiarismStatus === 'suspected' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-green-100 text-green-800'
                                  }`}>
                                    {result.plagiarismStatus}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="mr-2 text-sm text-gray-900">{result.similarityScore}%</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                                      <div 
                                        className={`h-2 rounded-full ${
                                          result.similarityScore >= 70 ? 'bg-red-500' :
                                          result.similarityScore >= 40 ? 'bg-yellow-500' :
                                          'bg-green-500'
                                        }`}
                                        style={{ width: `${result.similarityScore}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-500">
                                    {result.plagiarismStatus !== 'cleared' ? 'Not scheduled' : '-'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-500">
                                    {result.plagiarismStatus !== 'cleared' ? 'Pending' : '-'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                  {result.plagiarismStatus !== 'cleared' && (
                                    <div className="flex flex-col space-y-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleSendEmail([{ id: result.studentId, name: result.studentName, email: result.studentEmail }], assignment);
                                        }}
                                        className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-sm"
                                      >
                                        Send Email
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleViewReport(result.studentEmail, assignment.id);
                                        }}
                                        className="text-green-600 hover:text-green-900"
                                      >
                                        View Report
                                      </button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        
                        {/* Pagination Controls */}
                        {getFilteredStudentResults(assignment.id).length > STUDENTS_PER_PAGE && (
                          <div className="px-6 py-3 bg-white border-t border-gray-200 flex items-center justify-between">
                            <div className="flex-1 flex justify-between sm:hidden">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentPage = currentPages[assignment.id] || 1;
                                  if (currentPage > 1) {
                                    changePage(assignment.id, currentPage - 1);
                                  }
                                }}
                                disabled={(currentPages[assignment.id] || 1) <= 1}
                                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${(currentPages[assignment.id] || 1) <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                Previous
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentPage = currentPages[assignment.id] || 1;
                                  const totalPages = getTotalPages(assignment.id);
                                  if (currentPage < totalPages) {
                                    changePage(assignment.id, currentPage + 1);
                                  }
                                }}
                                disabled={(currentPages[assignment.id] || 1) >= getTotalPages(assignment.id)}
                                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${(currentPages[assignment.id] || 1) >= getTotalPages(assignment.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                Next
                              </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                              <div>
                                <p className="text-sm text-gray-700">
                                  Showing <span className="font-medium">{((currentPages[assignment.id] || 1) - 1) * STUDENTS_PER_PAGE + 1}</span> to{' '}
                                  <span className="font-medium">
                                    {Math.min((currentPages[assignment.id] || 1) * STUDENTS_PER_PAGE, getFilteredStudentResults(assignment.id).length)}
                                  </span>{' '}
                                  of <span className="font-medium">{getFilteredStudentResults(assignment.id).length}</span> students
                                </p>
                              </div>
                              <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentPage = currentPages[assignment.id] || 1;
                                      if (currentPage > 1) {
                                        changePage(assignment.id, currentPage - 1);
                                      }
                                    }}
                                    disabled={(currentPages[assignment.id] || 1) <= 1}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${(currentPages[assignment.id] || 1) <= 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    <span className="sr-only">Previous</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                  {/* Page numbers */}
                                  {Array.from({ length: getTotalPages(assignment.id) }, (_, i) => i + 1).map((page) => (
                                    <button
                                      key={page}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        changePage(assignment.id, page);
                                      }}
                                      aria-current={(currentPages[assignment.id] || 1) === page ? "page" : undefined}
                                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                        (currentPages[assignment.id] || 1) === page
                                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                      }`}
                                    >
                                      {page}
                                    </button>
                                  ))}
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentPage = currentPages[assignment.id] || 1;
                                      const totalPages = getTotalPages(assignment.id);
                                      if (currentPage < totalPages) {
                                        changePage(assignment.id, currentPage + 1);
                                      }
                                    }}
                                    disabled={(currentPages[assignment.id] || 1) >= getTotalPages(assignment.id)}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 ${(currentPages[assignment.id] || 1) >= getTotalPages(assignment.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  >
                                    <span className="sr-only">Next</span>
                                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </nav>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Email Dialog */}
        {emailDialogOpen && (
          <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                        Send Email to Students
                        {selectedAssignment && (
                          <span className="ml-2 text-sm text-gray-500">
                            for {selectedAssignment.title}
                          </span>
                        )}
                      </h3>
                      <div className="mt-4">
                        <label htmlFor="email-template" className="block text-sm font-medium text-gray-700">
                          Email Template
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="email-template"
                            rows={6}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={emailTemplate}
                            onChange={(e) => setEmailTemplate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">
                          Selected students: {selectedStudents.length}
                        </p>
                        <ul className="mt-2 text-sm text-gray-500 max-h-32 overflow-y-auto">
                          {selectedStudents.map((student) => (
                            <li key={student.id}>{student.name}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={handleConfirmSendEmail}
                  >
                    Send Emails
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setEmailDialogOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout_Courses>
  );
};

export default CourseDashboard; 