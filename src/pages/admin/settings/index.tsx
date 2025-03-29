import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';

const SettingsPage = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoFlagging, setAutoFlagging] = useState(true);
  const [riskThreshold, setRiskThreshold] = useState(75);
  const [reportFormat, setReportFormat] = useState('pdf');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement settings save functionality
    console.log('Saving settings:', {
      emailNotifications,
      autoFlagging,
      riskThreshold,
      reportFormat,
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Settings</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Notifications */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Receive email notifications for high-risk students</p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`${
                  emailNotifications ? 'bg-indigo-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    emailNotifications ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>

          {/* Auto Flagging */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Auto Flagging</h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Automatically flag suspicious behavior</p>
              </div>
              <button
                type="button"
                onClick={() => setAutoFlagging(!autoFlagging)}
                className={`${
                  autoFlagging ? 'bg-indigo-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
              >
                <span
                  className={`${
                    autoFlagging ? 'translate-x-5' : 'translate-x-0'
                  } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                />
              </button>
            </div>
          </div>

          {/* Risk Threshold */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Risk Threshold</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label htmlFor="risk-threshold" className="text-sm text-gray-500">
                  Set risk threshold percentage
                </label>
                <span className="text-sm font-medium text-gray-900">{riskThreshold}%</span>
              </div>
              <input
                type="range"
                id="risk-threshold"
                min="0"
                max="100"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Report Format */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Report Format</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="pdf"
                    checked={reportFormat === 'pdf'}
                    onChange={(e) => setReportFormat(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">PDF</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="csv"
                    checked={reportFormat === 'csv'}
                    onChange={(e) => setReportFormat(e.target.value)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">CSV</span>
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage; 