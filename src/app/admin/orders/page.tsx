"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { Package, Phone, Mail, MapPin, Calendar, DollarSign, Eye, Download, ChevronLeft } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Order {
  id: string
  orderId: string
  userId: string
  productName: string
  price: number
  customerInfo: {
    name: string
    phone: string
    email: string
    address: string
    notes?: string
  }
  designImageUrl: string
  createdAt: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  userInfo?: {
    userId: string
    firstName: string
    lastName: string
    email: string
    phone?: string
  }
}

// 管理员用户ID列表 - 实际应该从环境变量或数据库配置
const ADMIN_USER_IDS = ['user_2nxFZ5Xqx6xeDJb0pQDPvtxGbIp'] // 替换为您的实际用户ID

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

export default function OrdersPage() {
  const { userId, isSignedIn } = useAuth()
  const { toast } = useToast()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    totalRevenue: 0,
    statusCounts: { pending: 0, processing: 0, shipped: 0, delivered: 0 }
  })
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const isAdmin = userId && ADMIN_USER_IDS.includes(userId)

  // 获取订单数据
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/orders')
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

  useEffect(() => {
    if (isSignedIn && isAdmin) {
      fetchOrders()
    }
  }, [isSignedIn, isAdmin])

  if (!isSignedIn || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-light text-gray-800 mb-4">访问受限</h2>
          <p className="text-gray-600 mb-8">只有管理员可以查看订单</p>
          <Link href="/" className="inline-flex items-center space-x-2 bg-black text-white px-8 py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span>返回首页</span>
          </Link>
        </div>
      </div>
    )
  }

  const handleStatusChange = async (orderId: string, newStatus: string, targetUserId: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          status: newStatus,
          targetUserId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to update order status')
      }

      // 更新本地状态
      setOrders(orders.map(order => 
        order.orderId === orderId 
          ? { ...order, status: newStatus as Order['status'] }
          : order
      ))
      
      toast({
        title: "状态已更新",
        description: `订单状态已更新为: ${getStatusLabel(newStatus as Order['status'])}`,
      })
    } catch (error) {
      console.error('Error updating order status:', error)
      toast({
        title: "更新失败",
        description: "请重试",
        variant: "destructive",
      })
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
      ['订单号', '产品', '价格', '客户姓名', '电话', '地址', '状态', '下单时间'].join(','),
      ...filteredOrders.map(order => [
        order.orderId,
        order.productName,
        order.price,
        order.customerInfo.name,
        order.customerInfo.phone,
        order.customerInfo.address,
        getStatusLabel(order.status),
        new Date(order.createdAt).toLocaleString('zh-CN')
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `orders_${Date.now()}.csv`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-2xl font-light tracking-wide text-black">
              PETPO
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-lg font-medium text-gray-800">订单管理</span>
          </div>
          <button
            onClick={exportOrders}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white text-sm rounded hover:bg-gray-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>导出订单</span>
          </button>
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
                <p className="text-2xl font-semibold text-yellow-600">
                  {stats.statusCounts.pending}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">处理中</p>
                <p className="text-2xl font-semibold text-blue-600">
                  {stats.statusCounts.processing}
                </p>
              </div>
              <Package className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总销售额</p>
                <p className="text-2xl font-semibold text-green-600">
                  ¥{stats.totalRevenue}
                </p>
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
              <option value="all">全部</option>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="shipped">已发货</option>
              <option value="delivered">已送达</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  订单信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  客户信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  金额
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={order.designImageUrl}
                        alt="Design"
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.orderId}</p>
                        <p className="text-sm text-gray-600">{order.productName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString('zh-CN')}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">{order.userInfo?.firstName} {order.userInfo?.lastName}</p>
                      <p className="text-gray-600 flex items-center">
                        <Phone className="w-3 h-3 mr-1" />
                        {order.customerInfo.phone}
                      </p>
                      <p className="text-gray-600 flex items-center">
                        <Mail className="w-3 h-3 mr-1" />
                        {order.userInfo?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-lg font-semibold text-gray-900">¥{order.price}</p>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.orderId, e.target.value, order.userInfo?.userId || order.userId)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}
                    >
                      <option value="pending">待处理</option>
                      <option value="processing">处理中</option>
                      <option value="shipped">已发货</option>
                      <option value="delivered">已送达</option>
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                      <p className="text-sm"><span className="font-medium">订单号:</span> {selectedOrder.orderId}</p>
                      <p className="text-sm"><span className="font-medium">产品:</span> {selectedOrder.productName}</p>
                      <p className="text-sm"><span className="font-medium">价格:</span> ¥{selectedOrder.price}</p>
                      <p className="text-sm"><span className="font-medium">下单时间:</span> {new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}</p>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">客户信息</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <p className="text-sm"><span className="font-medium">姓名:</span> {selectedOrder.customerInfo.name}</p>
                      <p className="text-sm"><span className="font-medium">电话:</span> {selectedOrder.customerInfo.phone}</p>
                      <p className="text-sm"><span className="font-medium">邮箱:</span> {selectedOrder.customerInfo.email}</p>
                      <p className="text-sm"><span className="font-medium">地址:</span> {selectedOrder.customerInfo.address}</p>
                      {selectedOrder.customerInfo.notes && (
                        <p className="text-sm"><span className="font-medium">备注:</span> {selectedOrder.customerInfo.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Design Preview */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-2">设计预览</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      <img
                        src={selectedOrder.designImageUrl}
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