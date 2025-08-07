"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"

export default function TestPublishPage() {
  const { userId } = useAuth()
  const [testResults, setTestResults] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (message: string) => {
    console.log(message)
    setTestResults(prev => [...prev, message])
  }

  const testPublishAPI = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addResult("🧪 Starting publish API test...")
      addResult(`👤 User ID: ${userId || 'NOT_LOGGED_IN'}`)
      
      if (!userId) {
        addResult("❌ User not logged in - this should cause auth error")
      }

      const testImageUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU77wgAAAABJRU5ErkJggg=="
      const testDescription = "Test artwork from API test page"

      addResult("📡 Making POST request to /api/publish...")
      
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: testImageUrl,
          description: testDescription
        })
      })

      addResult(`📊 Response status: ${response.status}`)
      addResult(`📊 Response ok: ${response.ok}`)

      const data = await response.json()
      addResult(`📦 Response data: ${JSON.stringify(data, null, 2)}`)

      if (response.ok) {
        addResult("✅ Publish API test PASSED!")
      } else {
        addResult("❌ Publish API test FAILED!")
      }

    } catch (error) {
      addResult(`🚨 Error: ${error}`)
      addResult("❌ Publish API test FAILED with exception!")
    }
    
    setLoading(false)
  }

  const testGalleryAPI = async () => {
    setLoading(true)
    setTestResults([])
    
    try {
      addResult("🖼️ Starting gallery API test...")
      
      addResult("📡 Making GET request to /api/publish...")
      
      const response = await fetch('/api/publish')
      
      addResult(`📊 Response status: ${response.status}`)
      addResult(`📊 Response ok: ${response.ok}`)

      const data = await response.json()
      addResult(`📦 Response data: ${JSON.stringify(data, null, 2)}`)
      
      if (data.artworks) {
        addResult(`🎨 Found ${data.artworks.length} artworks`)
      }

      if (response.ok) {
        addResult("✅ Gallery API test PASSED!")
      } else {
        addResult("❌ Gallery API test FAILED!")
      }

    } catch (error) {
      addResult(`🚨 Error: ${error}`)
      addResult("❌ Gallery API test FAILED with exception!")
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Publish API Test Page</h1>
        
        <div className="space-y-4 mb-8">
          <button 
            onClick={testPublishAPI}
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Publish API'}
          </button>
          
          <button 
            onClick={testGalleryAPI}
            disabled={loading}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Gallery API'}
          </button>
          
          <button 
            onClick={async () => {
              setLoading(true)
              setTestResults([])
              try {
                addResult("🧪 Adding test data...")
                const response = await fetch('/api/test-data', { method: 'POST' })
                const data = await response.json()
                addResult(`📊 Test data response: ${JSON.stringify(data)}`)
                if (response.ok) {
                  addResult("✅ Test data added successfully!")
                } else {
                  addResult("❌ Failed to add test data")
                }
              } catch (error) {
                addResult(`🚨 Error: ${error}`)
              }
              setLoading(false)
            }}
            disabled={loading}
            className="bg-purple-600 text-white px-6 py-3 rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Test Data'}
          </button>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Test Results:</h2>
          <div className="space-y-2 font-mono text-sm">
            {testResults.map((result, index) => (
              <div key={index} className="p-2 bg-white rounded">
                {result}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}