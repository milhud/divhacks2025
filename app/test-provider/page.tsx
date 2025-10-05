"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function TestProviderAPI() {
  const [providerId, setProviderId] = useState('demo-provider-123')
  const [loading, setLoading] = useState(false)
  const [demoResult, setDemoResult] = useState<any>(null)
  const [dbResult, setDbResult] = useState<any>(null)
  const [addPatientResult, setAddPatientResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'demo' | 'database' | 'add-patient'>('demo')
  
  // Add patient form fields
  const [patientEmail, setPatientEmail] = useState('')
  const [condition, setCondition] = useState('')
  const [notes, setNotes] = useState('')

  const testDemoAPI = async () => {
    setLoading(true)
    setError(null)
    setDemoResult(null)

    try {
      console.log('Testing DEMO API with providerId:', providerId)
      
      const response = await fetch(`/api/providers/patients?providerId=${providerId}`)
      const data = await response.json()

      console.log('DEMO API Response:', data)

      if (response.ok) {
        setDemoResult(data)
      } else {
        setError(data.error || 'Unknown error')
      }
    } catch (err: any) {
      console.error('Test error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testDatabaseAPI = async () => {
    setLoading(true)
    setError(null)
    setDbResult(null)

    try {
      console.log('Testing DATABASE API with providerId:', providerId)
      
      const response = await fetch(`/api/providers/patients/db-version?providerId=${providerId}`)
      const data = await response.json()

      console.log('DATABASE API Response:', data)

      if (response.ok) {
        setDbResult(data)
      } else {
        setError(data.error || 'Unknown error')
      }
    } catch (err: any) {
      console.error('Test error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const testAddPatient = async () => {
    setLoading(true)
    setError(null)
    setAddPatientResult(null)

    try {
      console.log('Testing ADD PATIENT API')
      console.log('Provider ID:', providerId)
      console.log('Patient Email:', patientEmail)
      console.log('Condition:', condition)
      
      const response = await fetch('/api/providers/patients/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId,
          patientEmail,
          condition,
          notes
        })
      })
      
      const data = await response.json()
      console.log('ADD PATIENT API Response:', data)

      if (response.ok) {
        setAddPatientResult(data)
        // Clear form on success
        setPatientEmail('')
        setCondition('')
        setNotes('')
      } else {
        setError(data.error || data.message || 'Unknown error')
      }
    } catch (err: any) {
      console.error('Test error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const result = activeTab === 'demo' ? demoResult : activeTab === 'database' ? dbResult : addPatientResult

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">🧪 Provider API Test</h1>
        <p className="text-gray-600 mb-8">Testing GET /api/providers/patients endpoints</p>

        {/* Tab Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'demo'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            📦 Demo API
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'database'
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            💾 Get Patients
          </button>
          <button
            onClick={() => setActiveTab('add-patient')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'add-patient'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            ➕ Add Patient
          </button>
        </div>

        {/* Test Form */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Parameters</h2>
          
          {activeTab !== 'add-patient' ? (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Provider ID:</label>
                <input
                  type="text"
                  value={providerId}
                  onChange={(e) => setProviderId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder={activeTab === 'demo' ? 'demo-provider-123' : '550e8400-...'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {activeTab === 'demo' 
                    ? 'Try any ID - returns demo data'
                    : 'Use real provider UUID from database (see setup guide)'}
                </p>
              </div>

              <Button 
                onClick={activeTab === 'demo' ? testDemoAPI : testDatabaseAPI}
                disabled={loading || !providerId}
                className="w-full"
                size="lg"
              >
                {loading ? '⏳ Testing...' : activeTab === 'demo' ? '🚀 Test Demo API' : '💾 Test Database API'}
              </Button>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Provider ID:</label>
                  <input
                    type="text"
                    value={providerId}
                    onChange={(e) => setProviderId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="550e8400-e29b-41d4-a716-446655440001"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Real provider UUID from database
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Patient Email: *</label>
                  <input
                    type="email"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="patient@test.com"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Patient must have an existing account
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Condition / Diagnosis:</label>
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Lower back pain, ACL recovery, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional - main reason for treatment
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Notes:</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Additional notes about the patient..."
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional - any additional information
                  </p>
                </div>
              </div>

              <Button 
                onClick={testAddPatient}
                disabled={loading || !providerId || !patientEmail}
                className="w-full mt-4"
                size="lg"
              >
                {loading ? '⏳ Adding Patient...' : '➕ Add Patient to Provider'}
              </Button>
            </>
          )}
        </Card>

        {/* Results */}
        {error && (
          <Card className="p-6 mb-6 bg-red-50 border-red-200">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
          </Card>
        )}

        {result && (
          <Card className="p-6 mb-6 bg-green-50 border-green-200">
            <h3 className="text-lg font-semibold text-green-800 mb-4">✅ Success!</h3>
            
            {result.message && (
              <div className="mb-4 p-3 bg-blue-100 rounded">
                <p className="text-sm text-blue-800">ℹ️ {result.message}</p>
              </div>
            )}

            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Found {result.patients?.length || 0} patients
              </p>
            </div>

            {/* Patient Cards */}
            {result.patients && result.patients.length > 0 && (
              <div className="space-y-3">
                {result.patients.map((patient: any) => (
                  <div key={patient.id} className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{patient.name}</h4>
                        <p className="text-sm text-gray-600">{patient.email}</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        {patient.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                      <div>
                        <span className="text-gray-600">Condition:</span>
                        <span className="ml-2 font-medium">{patient.condition}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Progress:</span>
                        <span className="ml-2 font-medium">{patient.progress}%</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Pain Level:</span>
                        <span className="ml-2 font-medium">{patient.painLevel}/10</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Code:</span>
                        <span className="ml-2 font-mono text-xs">{patient.providerCode}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Raw JSON */}
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                📋 View Raw JSON Response
              </summary>
              <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </details>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-3">📖 How to Test</h3>
          
          {activeTab === 'demo' ? (
            <>
              <h4 className="font-medium mb-2 text-blue-600">Demo Version (Feature #1)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
                <li>Keep default provider ID or enter any value</li>
                <li>Click "Test Demo API"</li>
                <li>Should return 3 hardcoded demo patients</li>
                <li>Check console (F12) for logs</li>
              </ol>
              <div className="bg-blue-50 p-3 rounded">
                <p className="text-xs text-blue-800">
                  ✅ <strong>This version works!</strong> Returns demo data to verify API structure.
                </p>
              </div>
            </>
          ) : activeTab === 'database' ? (
            <>
              <h4 className="font-medium mb-2 text-green-600">Database Version (Feature #2)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
                <li>Follow setup guide in <code className="bg-gray-100 px-1 rounded">scripts/test-database-setup.md</code></li>
                <li>Create provider and patients in Supabase</li>
                <li>Enter real provider UUID</li>
                <li>Click "Test Database API"</li>
                <li>Should return real patients from database</li>
              </ol>
              <div className="bg-green-50 p-3 rounded mb-3">
                <p className="text-xs text-green-800">
                  🔧 <strong>Setup required:</strong> This queries real Supabase data.
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-xs text-yellow-800">
                  📝 <strong>Not set up yet?</strong> See <code>/scripts/test-database-setup.md</code> for step-by-step guide.
                </p>
              </div>
            </>
          ) : (
            <>
              <h4 className="font-medium mb-2 text-purple-600">Add Patient (Feature #3)</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 mb-4">
                <li>First, create a test patient account (sign up at your app)</li>
                <li>Enter your provider UUID from database</li>
                <li>Enter the patient's email address</li>
                <li>Optionally add condition and notes</li>
                <li>Click "Add Patient to Provider"</li>
                <li>Should create patient-provider relationship</li>
              </ol>
              <div className="bg-purple-50 p-3 rounded mb-3">
                <p className="text-xs text-purple-800">
                  ✅ <strong>New Feature!</strong> Tests POST endpoint to add patients.
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Important:</strong> Patient must already have an account. Create one first via signup!
                </p>
              </div>
            </>
          )}

          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium mb-2">✅ What to Verify:</h4>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• API endpoint responds (status 200)</li>
              <li>• Returns success: true</li>
              <li>• Returns patient array (3 for demo, variable for DB)</li>
              <li>• Each patient has: name, email, condition, status</li>
              <li>• Provider code generated correctly</li>
              <li>• Console logs show detailed API activity</li>
              {activeTab === 'database' && (
                <li>• Source field shows "database"</li>
              )}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  )
}
