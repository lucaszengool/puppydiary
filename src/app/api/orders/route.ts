import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

// GET /api/orders - 获取当前用户的订单列表
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 从 Clerk 用户元数据中获取订单
    const user = await clerkClient.users.getUser(userId);
    const orders = user.privateMetadata?.orders || [];
    
    // 按创建时间倒序排列
    const sortedOrders = orders.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({ 
      orders: sortedOrders,
      total: orders.length,
      success: true 
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/orders - 更新订单状态（管理员功能）
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, status, targetUserId } = await request.json();
    
    // 检查是否是管理员（这里简化处理，实际应该有专门的管理员检查）
    const ADMIN_USER_IDS = [process.env.ADMIN_USER_ID || 'user_admin'];
    const isAdmin = ADMIN_USER_IDS.includes(userId);
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 获取目标用户的订单
    const targetUser = await clerkClient.users.getUser(targetUserId);
    const currentMetadata = targetUser.privateMetadata || {};
    const orders = currentMetadata.orders || [];
    
    // 找到并更新订单
    const updatedOrders = orders.map((order: any) => {
      if (order.orderId === orderId) {
        return {
          ...order,
          status,
          updatedAt: new Date().toISOString()
        };
      }
      return order;
    });
    
    // 更新用户元数据
    await clerkClient.users.updateUser(targetUserId, {
      privateMetadata: {
        ...currentMetadata,
        orders: updatedOrders
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Order status updated'
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}