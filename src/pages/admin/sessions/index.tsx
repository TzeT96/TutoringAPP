import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { FiCalendar, FiSearch, FiFilter, FiPlus } from 'react-icons/fi';
import { mockCourses, mockSessions, Assignment, Course, Session, Student, StudentQuestions } from '@/data/mockData';

const SessionsPage = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedAssignment, setSelectedAssignment] = useState<string>('');
  const [createSessionOpen, setCreateSessionOpen] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Simulate API call to fetch sessions
    const fetchData = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setSessions(mockSessions);
        setCourses(mockCourses);
        
        // Flatten all assignments from courses
        const allAssignments = mockCourses.flatMap(course => 
          course.assignments.map(assignment => ({
            ...assignment,
            courseId: course.id,
            courseName: course.name
          }))
        );
        
        setAssignments(allAssignments);
        setLoading(false);
      } catch (err) {
        setError('Failed to load sessions');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const filteredSessions = sessions.filter(session => {
    // Filter by status
    if (filterStatus !== 'all' && session.status !== filterStatus) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !session.course.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !session.assignment.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !session.students.some(student => 
          student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          student.email.toLowerCase().includes(searchQuery.toLowerCase())
        )) {
      return false;
    }
    
    // Filter by selected course
    if (selectedCourse && session.courseId !== selectedCourse) {
      return false;
    }
    
    // Filter by selected assignment
    if (selectedAssignment && session.assignmentId !== selectedAssignment) {
      return false;
    }
    
    return true;
  });

  const handleCreateSession = async () => {
    // Create a new session with students who have suspected plagiarism
    
    // Find an assignment with suspected plagiarism
    const assignmentWithPlagiarism = assignments.find(assignment => 
      assignment.studentResults.some(result => 
        result.plagiarismStatus === 'suspected' || result.plagiarismStatus === 'confirmed'
      )
    );
    
    if (!assignmentWithPlagiarism) {
      alert('No assignments with suspected plagiarism found');
      return;
    }
    
    // Get the course details
    const course = courses.find(c => c.id === assignmentWithPlagiarism.courseId);
    
    if (!course) {
      alert('Course information not found');
      return;
    }
    
    // Get the students with suspected plagiarism
    const suspectedStudents = assignmentWithPlagiarism.studentResults
      .filter(result => result.plagiarismStatus === 'suspected' || result.plagiarismStatus === 'confirmed')
      .map(result => ({
        id: result.studentId,
        name: result.studentName,
        email: result.studentEmail || `${result.studentId}@university.edu`,
        riskLevel: result.plagiarismStatus === 'confirmed' ? 'high' : 'medium',
        emailStatus: 'pending',
        plagiarismStatus: result.plagiarismStatus,
        status: 'pending',
        verificationCode: `${result.studentName.charAt(0)}${result.studentId.slice(-4)}`
      } as Student));
    
    if (suspectedStudents.length === 0) {
      alert('No students with suspected plagiarism found in this assignment');
      return;
    }
    
    // Generate specific questions for each student
    const studentQuestions: StudentQuestions[] = suspectedStudents.map(student => ({
      studentId: student.id,
      studentName: student.name,
      questions: [
        `Can you explain your approach to problem ${Math.floor(Math.random() * 5) + 1}?`,
        `Walk me through your solution for the ${assignmentWithPlagiarism.type === 'quiz' ? 'question' : 'problem'} about ${['vectors', 'calculus', 'integration', 'kinematics', 'databases'][Math.floor(Math.random() * 5)]}.`,
        `What resources did you use to help with this ${assignmentWithPlagiarism.type}?`
      ]
    }));
    
    // Create a new session
    const newSession: Session = {
      id: `session${sessions.length + 1}`,
      course: course.name,
      courseId: course.id,
      assignment: assignmentWithPlagiarism.title,
      assignmentId: assignmentWithPlagiarism.id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      status: 'scheduled',
      students: suspectedStudents,
      plagiarismCase: {
        assignmentType: assignmentWithPlagiarism.type.charAt(0).toUpperCase() + assignmentWithPlagiarism.type.slice(1),
        similarityScore: Math.floor(Math.random() * 30) + 50, // Random score between 50-80
        description: `Suspected plagiarism in ${assignmentWithPlagiarism.title} involving ${suspectedStudents.length} students`,
        studentQuestions: studentQuestions
      }
    };
    
    // Add the new session to the list
    setSessions([...sessions, newSession]);
    
    alert('New tutoring session created successfully');
    setCreateSessionOpen(false);
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

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tutoring Sessions
          </h1>
          <button
            onClick={() => setCreateSessionOpen(prev => !prev)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            New Session
          </button>
        </div>

        {/* Filters and Search */}
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiFilter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <select
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="">All Courses</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={selectedAssignment}
                onChange={(e) => setSelectedAssignment(e.target.value)}
              >
                <option value="">All Assignments</option>
                {assignments
                  .filter(assignment => !selectedCourse || assignment.courseId === selectedCourse)
                  .map((assignment) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Create New Session Panel */}
        {createSessionOpen && (
          <div className="bg-white shadow rounded-lg p-4 sm:p-6 border border-indigo-200">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Tutoring Session</h2>
            <p className="text-sm text-gray-500 mb-4">
              This will automatically create a new tutoring session for students with suspected plagiarism on assignments. The system will generate appropriate questions for each student based on their assignment.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setCreateSessionOpen(false)}
                className="mr-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSession}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Session
              </button>
            </div>
          </div>
        )}

        {/* Sessions List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <FiCalendar className="h-12 w-12 mb-2" />
              <p>No tutoring sessions found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Session Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Students
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSessions.map((session) => (
                  <tr key={session.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {session.course}
                          </div>
                          <div className="text-sm text-gray-500">
                            {session.assignment}
                          </div>
                          {session.plagiarismCase && (
                            <div className="mt-1">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                Similarity: {session.plagiarismCase.similarityScore}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {session.students.length} student(s)
                      </div>
                      <div className="text-xs text-gray-500">
                        {session.students.map(student => student.name).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(session.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        session.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a 
                        href={`/admin/sessions/${session.id}`} 
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View Details
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SessionsPage; 