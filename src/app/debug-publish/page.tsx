"use client"

import { useState } from "react"
import { useAuth } from "@clerk/nextjs"
import PublishDialog from "@/components/PublishDialog"

export default function DebugPublishPage() {
  const { userId } = useAuth()
  const [showDialog, setShowDialog] = useState(false)
  const [testResults, setTestResults] = useState<string[]>([])
  
  const testImageUrl = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzAwYWNmZiIvPgogIDx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPgogICAgVGVzdCBJbWFnZQogIDwvdGV4dD4KPC9zdmc+"

  const addResult = (message: string) => {
    console.log(message)
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testDialogOpen = () => {
    addResult("🧪 Testing dialog open...")
    addResult(`👤 User ID: ${userId || 'NOT_LOGGED_IN'}`)
    setShowDialog(true)
    addResult("✅ Dialog state set to true")
  }

  const handleDialogClose = () => {
    addResult("🔄 Dialog close triggered")
    setShowDialog(false)
  }

  const handleDialogConfirm = async (description?: string) => {
    addResult("🚀 Dialog confirm triggered!")
    addResult(`📝 Description: ${description || 'none'}`)
    
    try {
      addResult("📡 Making API call to /api/publish...")
      
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: testImageUrl,
          description: description
        })
      })

      addResult(`📊 Response status: ${response.status}`)
      
      if (response.ok) {
        const result = await response.json()
        addResult(`✅ Publish successful: ${JSON.stringify(result)}`)
      } else {
        const error = await response.json()
        addResult(`❌ Publish failed: ${JSON.stringify(error)}`)
      }
    } catch (error) {
      addResult(`🚨 Error: ${error}`)
    }
    
    setShowDialog(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Publish Dialog Debug Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Controls */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded">
                <h3 className="font-medium">Current State</h3>
                <p>User ID: {userId || 'Not logged in'}</p>
                <p>Dialog Open: {showDialog ? 'Yes' : 'No'}</p>
              </div>
              
              <button
                onClick={testDialogOpen}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Test Open Dialog
              </button>
              
              <div className="p-4 bg-gray-100 rounded">
                <h3 className="font-medium mb-2">Test Image Preview</h3>
                <img 
                  src={testImageUrl} 
                  alt="Test" 
                  className="w-32 h-32 object-cover border rounded"
                />
              </div>
            </div>
          </div>

          {/* Test Results */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Test Results</h2>
            
            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500">No test results yet...</p>
              ) : (
                <div className="space-y-1 font-mono text-sm">
                  {testResults.map((result, index) => (
                    <div key={index} className="p-1">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <button 
              onClick={() => setTestResults([])}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Clear Results
            </button>
          </div>
        </div>
        
        {/* Dialog Debug Info */}
        {showDialog && (
          <div className="fixed top-4 left-4 bg-green-500 text-white p-4 rounded-lg z-[10000]">
            <h3 className="font-bold">Dialog Debug Info</h3>
            <p>showDialog: {showDialog.toString()}</p>
            <p>Dialog should be visible!</p>
          </div>
        )}
      </div>

      {/* Publish Dialog */}
      <PublishDialog
        isOpen={showDialog}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        imageUrl={testImageUrl}
      />
    </div>
  )
}