import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import prisma from '@/lib/prisma';
import { GetServerSideProps } from 'next';

interface PerplexitySentence {
  sentence: string;
  perplexity: number;
}

interface ReportData {
  studentName: string;
  studentEmail: string;
  assignmentName: string;
  courseCode: string;
  aiProbability: number;
  lowestPerplexitySentences: PerplexitySentence[];
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const assignmentId = params?.assignmentId as string;
  const studentEmail = params?.studentId as string;

  try {
    // Get submission details
    const submissions = await prisma.submissionDetail.findMany({
      where: {
        assignment_id: parseInt(assignmentId),
      },
      include: {
        assignment: true,
      },
    });

    // Find the submission that matches the student email
    const submission = submissions.find(sub => {
      let detectionResult;
      try {
        detectionResult = typeof sub.submission_detection_result === 'string' 
          ? JSON.parse(sub.submission_detection_result) 
          : sub.submission_detection_result;
        return detectionResult.student_email === studentEmail;
      } catch (e) {
        console.error('Error parsing detection result:', e);
        return false;
      }
    });

    if (!submission) {
      return {
        notFound: true,
      };
    }

    let detectionResult;
    try {
      if (typeof submission.submission_detection_result === 'string') {
        detectionResult = JSON.parse(submission.submission_detection_result);
      } else {
        detectionResult = submission.submission_detection_result;
      }
    } catch (e) {
      console.error('Error parsing detection result:', e);
      return { notFound: true };
    }

    const reportData: ReportData = {
      studentName: detectionResult.student_name,
      studentEmail: detectionResult.student_email,
      assignmentName: submission.assignment.assignment_name,
      courseCode: submission.assignment.course_code,
      aiProbability: detectionResult.ai_probability,
      lowestPerplexitySentences: detectionResult.top_5_lowest_perplexity_sentences,
    };

    return {
      props: {
        reportData,
      },
    };
  } catch (error) {
    console.error('Error fetching report data:', error);
    return { notFound: true };
  }
};

const ReportPage = ({ reportData }: { reportData: ReportData }) => {
  const handleDownload = () => {
    const reportText = `AI Detection Report
    
Student: ${reportData.studentName} (${reportData.studentEmail})
Assignment: ${reportData.assignmentName}
Course: ${reportData.courseCode}
AI Probability: ${(reportData.aiProbability * 100).toFixed(1)}%

Most AI-Like Sentences (Lowest Perplexity Scores):
${reportData.lowestPerplexitySentences.map((s, i) => 
  `\n${i + 1}. "${s.sentence}"\n   Perplexity Score: ${s.perplexity.toFixed(2)} (lower score indicates higher likelihood of AI generation)`
).join('\n')}`;

    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Detection_Report_${reportData.studentName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-indigo-500 to-purple-600">
            <h1 className="text-xl font-semibold text-white">AI Detection Report</h1>
          </div>
          
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Student and Assignment Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Student</h3>
                    <p className="mt-1 text-sm text-gray-900">{reportData.studentName}</p>
                    <p className="text-sm text-gray-500">{reportData.studentEmail}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Assignment</h3>
                    <p className="mt-1 text-sm text-gray-900">{reportData.assignmentName}</p>
                    <p className="text-sm text-gray-500">{reportData.courseCode}</p>
                  </div>
                </div>
              </div>

              {/* AI Probability */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-500">AI Probability Score</h3>
                <div className="mt-2 flex items-center">
                  <div className="flex-1">
                    <div className="bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div 
                        className={`h-4 rounded-full ${
                          reportData.aiProbability >= 0.8 ? 'bg-red-500' :
                          reportData.aiProbability >= 0.6 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${reportData.aiProbability * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {(reportData.aiProbability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Most AI-Like Sentences */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Most AI-Like Sentences</h3>
                <p className="text-sm text-gray-500 mb-4">Lower perplexity scores indicate higher likelihood of AI-generated content.</p>
                <div className="space-y-4">
                  {reportData.lowestPerplexitySentences.map((sentence, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start">
                        <span className="flex-shrink-0 bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md text-sm font-medium">
                          #{index + 1}
                        </span>
                        <div className="ml-4">
                          <p className="text-sm text-gray-900">{sentence.sentence}</p>
                          <p className="mt-1 text-sm text-gray-500">
                            Perplexity Score: {sentence.perplexity.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Download Button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleDownload}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportPage; 