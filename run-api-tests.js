/**
 * This script runs API tests with node-fetch
 */

// Import dependencies using require (for Node)
const fetch = require('node-fetch');

// Import the test definitions
const { apiTests } = require('./api-test.js');

// Define base URL
const baseUrl = 'http://localhost:3000/api';

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

// Run all tests
runTests().catch(console.error); 