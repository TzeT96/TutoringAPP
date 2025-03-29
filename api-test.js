/**
 * API Testing Script for Tutoring Web UI
 * 
 * This script tests all API endpoints to ensure they're working correctly with mock data.
 * It will log success or errors for each endpoint.
 */

const baseUrl = 'http://localhost:3000/api';

// Define test cases for each API endpoint
const apiTests = [
  // Authentication APIs
  {
    name: 'Auth - Signin (admin)',
    endpoint: '/auth/signin',
    method: 'POST',
    body: { 
      email: 'admin@example.com', 
      password: 'password123',
      redirect: false,
      callbackUrl: 'http://localhost:3000/admin' 
    },
    expectedStatus: [200, 302]
  },
  {
    name: 'Auth - Signin (student)',
    endpoint: '/auth/signin',
    method: 'POST',
    body: { 
      email: 'student@example.com', 
      password: 'password123',
      redirect: false,
      callbackUrl: 'http://localhost:3000/student' 
    },
    expectedStatus: [200, 302]
  },
  
  // Admin APIs
  {
    name: 'Admin - Get All Sessions',
    endpoint: '/admin/sessions',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Admin - Get Session by ID',
    endpoint: '/admin/sessions/session-phy211-exam-1-student-2',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Admin - Get Dashboard Data',
    endpoint: '/admin/dashboard',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Admin - Get All Students',
    endpoint: '/admin/students',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Admin - Get Session Questions',
    endpoint: '/admin/sessions/session-phy211-exam-1-student-2/questions',
    method: 'GET',
    expectedStatus: 200
  },
  
  // Student APIs
  {
    name: 'Verify Code',
    endpoint: '/verify-code',
    method: 'POST',
    body: { code: 'DEF456' },
    expectedStatus: 200
  },
  {
    name: 'Get Questions By Code',
    endpoint: '/questions/DEF456',
    method: 'GET',
    expectedStatus: 200
  },
  {
    name: 'Submit Answer',
    endpoint: '/submit-answer',
    method: 'POST',
    body: { 
      questionId: 'q2', 
      code: 'DEF456', 
      textAnswer: 'Test answer for API testing' 
    },
    expectedStatus: 200
  },
  {
    name: 'Complete Session',
    endpoint: '/complete-session',
    method: 'POST',
    body: { code: 'DEF456' },
    expectedStatus: 200
  },
  
  // Generate and Reset codes
  {
    name: 'Generate Code',
    endpoint: '/generate-code',
    method: 'POST',
    body: { sessionId: 'session-phy211-exam-1-student-2' },
    expectedStatus: 200
  },
  {
    name: 'Reset Code',
    endpoint: '/reset-code',
    method: 'POST',
    body: { sessionId: 'session-phy211-exam-1-student-2' },
    expectedStatus: 200
  }
];

// Helper function to run tests
async function runTests() {
  console.log('🧪 Starting API Tests\n');
  
  let successCount = 0;
  let failCount = 0;

  for (const test of apiTests) {
    try {
      console.log(`Testing: ${test.name}`);
      
      const options = {
        method: test.method,
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      if (test.body) {
        options.body = JSON.stringify(test.body);
      }
      
      const url = `${baseUrl}${test.endpoint}`;
      const response = await fetch(url, options);
      
      const isExpectedStatus = Array.isArray(test.expectedStatus) 
        ? test.expectedStatus.includes(response.status)
        : response.status === test.expectedStatus;
      
      if (isExpectedStatus) {
        console.log(`✅ Success: ${test.name} (Status: ${response.status})`);
        
        // Log response data for debugging
        try {
          const data = await response.json();
          console.log('Response data:', JSON.stringify(data).substring(0, 150) + '...');
        } catch (e) {
          console.log('No JSON response body or redirect response');
        }
        
        successCount++;
      } else {
        console.log(`❌ Failed: ${test.name} - Expected status ${test.expectedStatus}, got ${response.status}`);
        try {
          const data = await response.json();
          console.log('Error response:', data);
        } catch (e) {
          console.log('No error details available');
        }
        failCount++;
      }
    } catch (error) {
      console.log(`❌ Error: ${test.name} - ${error.message}`);
      failCount++;
    }
    
    console.log('-------------------');
  }
  
  console.log(`\n📊 Test Summary: ${successCount} passed, ${failCount} failed`);
  console.log(`🏁 Tests Completed`);
}

// Run all tests when executed directly in browser
if (typeof window !== 'undefined') {
  runTests().catch(console.error);
}

// Export for use in Node.js
if (typeof module !== 'undefined') {
  module.exports = { apiTests, runTests };
}
