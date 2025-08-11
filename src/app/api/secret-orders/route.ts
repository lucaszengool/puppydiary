import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_PASSWORD = 'Z341298go';

// GET /api/secret-orders - 获取所有订单（密码验证）
export async function GET(request: NextRequest) {
  try {
    // 从请求头获取密码
    const password = request.headers.get('x-admin-password');
    
    if (!password || password !== ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // 从 Supabase 获取所有订单
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const allOrders = orders || [];
    const stats = {
      totalOrders: allOrders.length,
      totalRevenue: allOrders.reduce((sum: number, order: any) => sum + (order.price || 0), 0),
      statusCounts: {
        pending: allOrders.filter((order: any) => order.status === 'pending').length,
        processing: allOrders.filter((order: any) => order.status === 'processing').length,
        shipped: allOrders.filter((order: any) => order.status === 'shipped').length,
        delivered: allOrders.filter((order: any) => order.status === 'delivered').length
      }
    };

    // 数据已经按created_at倒序排列了，不需要再次排序

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 过滤订单
    let filteredOrders = allOrders;
    if (status && status !== 'all') {
      filteredOrders = allOrders.filter((order: any) => order.status === status);
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      orders: paginatedOrders,
      stats,
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching secret orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}