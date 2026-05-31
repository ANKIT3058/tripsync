'use client'

import AdminLayout from '@/components/admin/AdminLayout'
import { useEffect, useState } from 'react'

interface EnvStatus {
  baseUrl?: string
  hasApiKey?: boolean
}

export default function DebugEnvPage() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null)

  useEffect(() => {
    fetch('/api/admin/debug/env')
      .then(res => res.json())
      .then(setEnvStatus)
      .catch(console.error)
  }, [])

  return (
    <AdminLayout title="Environment Debug">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 p-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-4">
          EPS Rapid API Configuration Status
        </h2>
        
        {envStatus ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">Base URL</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {envStatus.baseUrl || 'Not configured'}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium text-slate-900 dark:text-slate-100">API Key</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {envStatus.hasApiKey ? '✅ Configured' : '❌ Missing'}
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Environment Variables Needed:</h3>
              <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                <li>• EPS_RAPID_BASE_URL (optional, defaults to test.ean.com)</li>
                <li>• EPS_RAPID_API_KEY (required for API calls)</li>
              </ul>
            </div>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </AdminLayout>
  )
}