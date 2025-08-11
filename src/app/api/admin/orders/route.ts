import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// GET /api/admin/orders - 获取所有订单（管理员）
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 检查管理员权限
    const ADMIN_USER_IDS = [
      process.env.ADMIN_USER_ID || 'user_admin',
      'user_2nxFZ5Xqx6xeDJb0pQDPvtxGbIp' // 添加您的实际用户ID
    ];
    
    if (!ADMIN_USER_IDS.includes(userId)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // 获取所有用户（限制数量以避免性能问题）
    const usersResponse = await clerkClient.users.getUserList({
      limit: 500, // 根据需要调整
    });
    
    const allOrders: any[] = [];
    const stats = {
      totalOrders: 0,
      totalRevenue: 0,
      statusCounts: {
        pending: 0,
        processing: 0,
        shipped: 0,
        delivered: 0
      }
    };

    // 收集所有用户的订单
    for (const user of usersResponse) {
      const orders = user.privateMetadata?.orders || [];
      
      for (const order of orders) {
        const enrichedOrder = {
          ...order,
          userInfo: {
            userId: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.emailAddresses?.[0]?.emailAddress,
            phone: user.phoneNumbers?.[0]?.phoneNumber
          }
        };
        
        allOrders.push(enrichedOrder);
        
        // 更新统计
        stats.totalOrders++;
        stats.totalRevenue += order.price || 0;
        if (stats.statusCounts[order.status as keyof typeof stats.statusCounts] !== undefined) {
          stats.statusCounts[order.status as keyof typeof stats.statusCounts]++;
        }
      }
    }

    // 按创建时间倒序排列
    allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // 获取查询参数
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // 过滤订单
    let filteredOrders = allOrders;
    if (status && status !== 'all') {
      filteredOrders = allOrders.filter(order => order.status === status);
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
    console.error('Error fetching admin orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}