'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminSetup() {
  const [status, setStatus] = useState<{
    loading: boolean;
    success?: boolean;
    message?: string;
    admin?: any;
    tablesCreated?: boolean;
    categoriesCreated?: boolean;
    error?: string;
  }>({
    loading: true
  });

  useEffect(() => {
    async function checkDbStatus() {
      try {
        const response = await fetch('/api/admin/init-db');
        const data = await response.json();
        
        setStatus({
          loading: false,
          success: data.success,
          message: data.message,
          admin: data.admin,
          tablesCreated: data.tablesCreated,
          categoriesCreated: data.categoriesCreated,
          error: data.error
        });
      } catch (error) {
        setStatus({
          loading: false,
          success: false,
          message: 'Failed to check database status',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    checkDbStatus();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-700">Database Setup</h1>
          <p className="mt-2 text-gray-600">Initialize your Woman and Business blog database</p>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          {status.loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Checking database status...</p>
            </div>
          ) : status.success ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-lg font-medium text-green-800">{status.message}</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Database Status:</h3>
                <ul className="space-y-2 pl-5">
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <span className="font-medium">Admin user created:</span>
                      <div className="text-sm text-gray-600 mt-1">
                        Email: {status.admin?.email}<br />
                        ID: {status.admin?.id}<br />
                        Role: {status.admin?.role}
                      </div>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Tables created: {status.tablesCreated ? 'Yes' : 'No'}</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">Categories initialized: {status.categoriesCreated ? 'Yes' : 'No'}</span>
                  </li>
                </ul>
              </div>
              
              <div className="pt-4 flex justify-center">
                <Link
                  href="/admin"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Go to Admin Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="h-5 w-5 text-yellow-500 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h2 className="text-lg font-medium text-yellow-800">{status.message}</h2>
                    {status.error && <p className="mt-1 text-sm text-yellow-700">{status.error}</p>}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Setup Instructions:</h3>
                <ol className="list-decimal pl-5 space-y-3">
                  <li>
                    <span className="font-medium">Log in to your Supabase dashboard:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Go to <a href="https://app.supabase.io" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">https://app.supabase.io</a> and sign in to your account.
                    </p>
                  </li>
                  <li>
                    <span className="font-medium">Open SQL Editor:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Navigate to the SQL Editor section in your Supabase project dashboard.
                    </p>
                  </li>
                  <li>
                    <span className="font-medium">Run the database initialization script:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      Copy the contents of the <code className="bg-gray-100 px-1 py-0.5 rounded">supabase-schema.sql</code> file from the project root and paste it into the SQL Editor. Then click "Run" to execute the script.
                    </p>
                  </li>
                  <li>
                    <span className="font-medium">Refresh this page:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      After running the script, come back to this page and refresh to verify that the database was initialized successfully.
                    </p>
                  </li>
                </ol>
              </div>
              
              <div className="pt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Refresh Status
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 