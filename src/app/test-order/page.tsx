'use client'

import { useState } from 'react'

export default function TestOrderPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testOrder = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/preorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: 'hoodie-4',
          productName: '测试卫衣 - M码', 
          price: 99,
          designImageUrl: 'https://example.com/test-design.jpg',
          customerInfo: {
            name: '测试客户',
            phone: '13800138000',
            email: 'test@example.com', 
            address: '北京市朝阳区测试路123号',
            notes: '测试订单'
          }
        })
      })

      const data = await response.json()
      setResult({ status: response.status, data })
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : String(error) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">订单提交测试</h1>
        
        <button
          onClick={testOrder}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '测试中...' : '测试订单提交'}
        </button>
        
        {result && (
          <div className="mt-8 p-4 bg-white rounded border">
            <h2 className="text-xl font-bold mb-4">测试结果:</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}