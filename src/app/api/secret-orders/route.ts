import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

const ADMIN_PASSWORD = 'Z341298go';

// GET /api/secret-orders - 获取所有订单（密码验证）
export async function GET(request: NextRequest) {
  console.log('🔍 [Secret Orders API] API被调用');
  
  try {
    // 从请求头获取密码
    const password = request.headers.get('x-admin-password');
    
    console.log('🔐 [Secret Orders API] 密码验证:', {
      hasPassword: !!password,
      passwordMatch: password === ADMIN_PASSWORD
    });
    
    if (!password || password !== ADMIN_PASSWORD) {
      console.error('❌ [Secret Orders API] 密码验证失败');
      return NextResponse.json({ error: 'Invalid password' }, { status: 403 });
    }

    console.log('🗄️ [Secret Orders API] 检查数据库连接:', {
      hasSupabaseAdmin: !!supabaseAdmin
    });

    if (!supabaseAdmin) {
      console.error('❌ [Secret Orders API] 数据库未配置');
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    console.log('📊 [Secret Orders API] 查询数据库订单...');
    
    // 从 Supabase 获取所有订单
    const { data: orders, error } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    console.log('📈 [Secret Orders API] 数据库查询结果:', {
      hasError: !!error,
      ordersCount: orders ? orders.length : 0,
      errorMessage: error ? error.message : null
    });

    if (error) {
      console.error('💥 [Secret Orders API] Supabase查询错误:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    const allOrders = orders || [];
    
    console.log('🧮 [Secret Orders API] 计算统计信息...', {
      totalOrdersFound: allOrders.length
    });
    
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

    console.log('📊 [Secret Orders API] 统计信息:', stats);

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    console.log('🔍 [Secret Orders API] 查询参数:', {
      status: status || 'all',
      page,
      limit
    });

    // 过滤订单
    let filteredOrders = allOrders;
    if (status && status !== 'all') {
      filteredOrders = allOrders.filter((order: any) => order.status === status);
      console.log(`🎯 [Secret Orders API] 按状态过滤 ${status}:`, {
        filteredCount: filteredOrders.length
      });
    }

    // 分页
    const startIndex = (page - 1) * limit;
    const paginatedOrders = filteredOrders.slice(startIndex, startIndex + limit);
    
    console.log('📄 [Secret Orders API] 分页结果:', {
      startIndex,
      paginatedCount: paginatedOrders.length,
      totalPages: Math.ceil(filteredOrders.length / limit)
    });

    const response = {
      success: true,
      orders: paginatedOrders,
      stats,
      pagination: {
        page,
        limit,
        total: filteredOrders.length,
        totalPages: Math.ceil(filteredOrders.length / limit)
      }
    };

    console.log('✅ [Secret Orders API] 成功返回响应:', {
      ordersReturned: paginatedOrders.length,
      hasStats: !!response.stats,
      hasPagination: !!response.pagination
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 [Secret Orders API] 获取订单异常:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}