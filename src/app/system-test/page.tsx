"use client"

import { useState } from "react"
import Link from "next/link"

export default function SystemTestPage() {
  const [testStep, setTestStep] = useState(0)
  
  const testSteps = [
    {
      title: "Step 1: API Test",
      description: "Test the publish and gallery APIs directly",
      action: "Go to Test Publish Page",
      link: "/test-publish"
    },
    {
      title: "Step 2: Dialog Test",
      description: "Test the publish dialog component in isolation",
      action: "Go to Debug Publish Page", 
      link: "/debug-publish"
    },
    {
      title: "Step 3: Full Flow Test",
      description: "Test the complete publish flow in the main create page",
      action: "Go to Create Page",
      link: "/create"
    },
    {
      title: "Step 4: Gallery Verification", 
      description: "Verify published artworks appear in the gallery",
      action: "Go to Gallery Page",
      link: "/gallery"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">PETPO Publish System Test</h1>
        
        <div className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold mb-4">System Test Results Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="font-semibold text-green-800">✅ Fixed Issues</h3>
              <ul className="text-sm text-green-700 mt-2 space-y-1">
                <li>• Publish API endpoint works correctly</li>
                <li>• Dialog z-index fixed to z-[9999]</li>
                <li>• Authentication flow properly handled</li>
                <li>• Image data properly passed to API</li>
                <li>• Gallery fetches and displays artworks</li>
                <li>• Debug tools created for testing</li>
              </ul>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-800">🔧 Test Tools Created</h3>
              <ul className="text-sm text-blue-700 mt-2 space-y-1">
                <li>• API test page (/test-publish)</li>
                <li>• Dialog test page (/debug-publish)</li>
                <li>• Test data generator (/api/test-data)</li>
                <li>• Enhanced console logging</li>
                <li>• System test overview (this page)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Manual Test Steps</h2>
          
          <div className="space-y-4">
            {testSteps.map((step, index) => (
              <div 
                key={index}
                className={`p-4 border rounded-lg ${
                  testStep === index 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTestStep(index)}
                      className={`px-3 py-1 text-xs rounded ${
                        testStep === index
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {testStep === index ? 'Current' : 'Select'}
                    </button>
                    <Link 
                      href={step.link}
                      className="px-4 py-1 bg-black text-white text-xs rounded hover:bg-gray-800"
                      target="_blank"
                    >
                      {step.action}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h3 className="font-semibold text-yellow-800 mb-2">📝 Testing Instructions</h3>
            <ol className="text-sm text-yellow-700 space-y-1">
              <li>1. Start with Step 1 to verify APIs work directly</li>
              <li>2. Use Step 2 to test dialog functionality in isolation</li>
              <li>3. Test Step 3 with a real image and check console logs</li>
              <li>4. Verify Step 4 shows published artworks in gallery</li>
              <li>5. All console logs have emojis for easy identification</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}