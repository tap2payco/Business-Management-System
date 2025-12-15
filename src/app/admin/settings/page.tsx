"use client";

import React, { useState } from 'react';
import { Settings, Shield, Server, Database, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // These would typically come from an API, but for now we'll mock/display based on known env vars
  // Note: We can't access server env vars directly in client, so this is illustrative UI design
  const systemStatus = {
    database: 'Connected (Supabase)',
    environment: process.env.NODE_ENV === 'production' ? 'Production' : 'Development',
    version: '1.0.0',
    aiModel: 'Nebius AI (meta-llama/Meta-Llama-3.1-70B-Instruct)',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">System Settings</h1>
        <p className="text-gray-500">Global configuration for the platform</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg flex items-center">
                <Server className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="font-semibold text-gray-700">System Status</h2>
            </div>
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Environment</label>
                        <div className="flex items-center mt-1">
                             <div className={`h-2.5 w-2.5 rounded-full mr-2 ${systemStatus.environment === 'Production' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                             <span className="text-sm font-medium">{systemStatus.environment}</span>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">Database</label>
                        <div className="flex items-center mt-1">
                             <Database className="h-4 w-4 text-blue-500 mr-2" />
                             <span className="text-sm font-medium">{systemStatus.database}</span>
                        </div>
                    </div>
                    <div className="col-span-2">
                        <label className="text-xs font-medium text-gray-500 uppercase">AI Integration</label>
                        <div className="mt-1 p-2 bg-gray-50 rounded text-sm text-gray-700 font-mono border border-gray-100">
                            {systemStatus.aiModel}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Feature Flags / Maintenance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-lg flex items-center">
                <Shield className="h-5 w-5 text-gray-500 mr-2" />
                <h2 className="font-semibold text-gray-700">Security & Maintenance</h2>
            </div>
            <div className="p-6">
                <div className="flex items-center justify-between py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">Maintenance Mode</h3>
                        <p className="text-sm text-gray-500">Prevent new logins and signups</p>
                    </div>
                     <button 
                        onClick={() => setMaintenanceMode(!maintenanceMode)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${maintenanceMode ? 'bg-indigo-600' : 'bg-gray-200'}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
                 <div className="flex items-center justify-between py-4">
                    <div>
                        <h3 className="text-sm font-medium text-gray-900">New Business Registration</h3>
                        <p className="text-sm text-gray-500">Allow new businesses to register</p>
                    </div>
                     <button 
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-green-500"
                    >
                        <span className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out translate-x-5" />
                    </button>
                </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 rounded-b-lg border-t border-gray-100 flex justify-end">
                <button className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
