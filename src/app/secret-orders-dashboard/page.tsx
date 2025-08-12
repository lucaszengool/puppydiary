"use client"

import { useState, useEffect } from 'react'
import { Package, Phone, Mail, Calendar, DollarSign, Eye, Download } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Order {
  id: string
  order_id: string
  user_id: string
  product_name: string
  price: number
  customer_info: {
    name: string
    phone: string
    email: string
    address: string
    notes?: string
  }
  user_info?: {
    firstName: string
    lastName: string
    email: string
  }
  design_image_url: string
  created_at: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
}

interface OrderStats {
  totalOrders: number
  totalRevenue: number
  statusCounts: {
    

    pending: number
    processing: number
    shipped: number
    delivered: number
  }
}

// 密码设置 - 可以设置环境变量或直接写在这里
const ADMIN_PASSWORD = 'Z341298go'

export default function SecretOrdersDashboard() {
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    statusCounts: { pending: 0, processing: 0, shipped: 0, delivered: 0 }
  })
  const [loading, setLoading] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // 验证密码
  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      fetchOrders()
      toast({
        title: "登录成功",
        description: "欢迎访问订单管理",
      })
    } else {
      toast({
        title: "密码错误",
        description: "请检查密码",
        variant: "destructive",
      })
    }
  }

  // 获取订单数据
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/secret-orders', {
        headers: {
          'x-admin-password': ADMIN_PASSWORD
        }
      })
      if (!response.ok) {
        throw new Error('Failed to fetch orders')
      }
      const data = await response.json()
      setOrders(data.orders)
      setStats(data.stats)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "获取订单失败",
        description: "请刷新页面重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusLabel = (status: Order['status']) => {
    const labels = {
      pending: '待处理',
      processing: '处理中',
      shipped: '已发货',
      delivered: '已送达'
    }
    return labels[status]
  }

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800'
    }
    return colors[status]
  }

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus)

  const exportOrders = () => {
    const csv = [
      ['订单号', '产品', '价格', '客户姓名', '电话', '邮箱', '地址', '状态', '下单时间'].join(','),
      ...filteredOrders.map(order => [
        order.order_id,
        order.product_name,
        order.price,
        order.customer_info.name,
        order.customer_info.phone,
        order.customer_info.email || order.user_info?.email || '',
        order.customer_info.address,
        getStatusLabel(order.status),
        new Date(order.created_at).toLocaleString('zh-CN')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `orders_${Date.now()}.csv`
    link.click()
  }

  // 登录界面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="text-center mb-6">
            <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-900">订单管理系统</h1>
            <p className="text-gray-600 mt-2">请输入管理密码</p>
          </div>
          
          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入密码"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              登录
            </button>
          </form>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            这是一个隐藏的管理界面
          </div>
        </div>
      </div>
    )
  }

  // 订单管理界面
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Package className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-semibold text-gray-900">订单管理</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportOrders}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>导出订单</span>
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              退出
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总订单数</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalOrders}</p>
              </div>
              <Package className="w-8 h-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待处理</p>
                <p className="text-2xl font-semibold text-yellow-600">{stats.statusCounts.pending}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">处理中</p>
                <p className="text-2xl font-semibold text-blue-600">{stats.statusCounts.processing}</p>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总销售额</p>
                <p className="text-2xl font-semibold text-green-600">¥{stats.totalRevenue}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">筛选状态:</span>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部 ({orders.length})</option>
              <option value="pending">待处理 ({stats.statusCounts.pending})</option>
              <option value="processing">处理中 ({stats.statusCounts.processing})</option>
              <option value="shipped">已发货 ({stats.statusCounts.shipped})</option>
              <option value="delivered">已送达 ({stats.statusCounts.delivered})</option>
            </select>
            <button
              onClick={fetchOrders}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200"
            >
              刷新
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">加载中...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">暂无订单</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">订单信息</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">客户信息</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.order_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={order.design_image_url}
                            alt="Design"
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{order.order_id}</p>
                            <p className="text-sm text-gray-600">{order.product_name}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.created_at).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {order.user_info?.firstName} {order.user_info?.lastName} / {order.customer_info.name}
                          </p>
                          <p className="text-gray-600 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {order.customer_info.phone}
                          </p>
                          <p className="text-gray-600 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {order.customer_info.email || order.user_info?.email}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {order.customer_info.address}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-lg font-semibold text-gray-900">¥{order.price}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                        >
                          查看详情
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Detail Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">订单详情</h2>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-6">
                  {/* Order Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">订单信息</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm"><span className="font-medium">订单号:</span> {selectedOrder.order_id}</p>
                      <p className="text-sm"><span className="font-medium">产品:</span> {selectedOrder.product_name}</p>
                      <p className="text-sm"><span className="font-medium">价格:</span> ¥{selectedOrder.price}</p>
                      <p className="text-sm"><span className="font-medium">状态:</span> {getStatusLabel(selectedOrder.status)}</p>
                      <p className="text-sm"><span className="font-medium">下单时间:</span> {new Date(selectedOrder.created_at).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">客户信息</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm"><span className="font-medium">用户:</span> {selectedOrder.user_info?.firstName} {selectedOrder.user_info?.lastName}</p>
                      <p className="text-sm"><span className="font-medium">收货人:</span> {selectedOrder.customer_info.name}</p>
                      <p className="text-sm"><span className="font-medium">电话:</span> {selectedOrder.customer_info.phone}</p>
                      <p className="text-sm"><span className="font-medium">邮箱:</span> {selectedOrder.customer_info.email || selectedOrder.user_info?.email}</p>
                      <p className="text-sm"><span className="font-medium">地址:</span> {selectedOrder.customer_info.address}</p>
                      {selectedOrder.customer_info.notes && (
                        <p className="text-sm"><span className="font-medium">备注:</span> {selectedOrder.customer_info.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Design Preview */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">设计预览</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <img
                        src={selectedOrder.design_image_url}
                        alt="Design"
                        className="w-full max-w-sm mx-auto rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}