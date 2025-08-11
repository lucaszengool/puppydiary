import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  console.log('🎯 [API] Enhanced-preorder API 被调用');
  
  try {
    const { userId } = auth();
    const actualUserId = userId || 'guest';
    
    console.log('👤 [API] 用户认证信息:', { 
      userId, 
      actualUserId,
      hasAuth: !!userId 
    });

    const body = await request.json();
    console.log('📦 [API] 接收到的请求体:', body);
    
    const {
      productId,
      productName,
      productType,
      size,
      price,
      designImageUrl,
      frameImage,
      customerInfo
    } = body;

    console.log('🔍 [API] 解析的字段:', {
      productId: !!productId,
      productName: !!productName,
      productType: !!productType,
      size: !!size,
      price: !!price,
      designImageUrl: !!designImageUrl,
      frameImage: !!frameImage,
      customerInfo: !!customerInfo,
      customerInfoFields: customerInfo ? Object.keys(customerInfo) : []
    });

    if (!productId || !productName || !size || !customerInfo) {
      console.error('❌ [API] 缺少必填字段:', {
        productId: !!productId,
        productName: !!productName,
        size: !!size,
        customerInfo: !!customerInfo
      });
      
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const orderData = {
      id: `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: actualUserId,
      productId,
      productName,
      productType,
      size,
      price,
      designImageUrl,
      frameImage,
      customerInfo: {
        name: customerInfo.name,
        email: customerInfo.email,
        phone: customerInfo.phone,
        address: customerInfo.address,
        height: customerInfo.height
      },
      status: 'pending',
      createdAt: new Date().toISOString(),
      orderType: 'enhanced-preorder'
    };

    console.log('✅ [API] 成功创建订单数据:', {
      orderId: orderData.id,
      userId: orderData.userId,
      productName: orderData.productName,
      size: orderData.size,
      price: orderData.price,
      customerName: orderData.customerInfo.name,
      customerEmail: orderData.customerInfo.email,
      createdAt: orderData.createdAt
    });

    // 保存到数据库
    console.log('💾 [API] 开始保存订单到数据库...');
    
    if (!supabaseAdmin) {
      console.error('❌ [API] 数据库未配置');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // 根据现有数据库结构调整字段 - 完全匹配现有订单的字段结构
    const dbOrder = {
      order_id: orderData.id,
      user_id: orderData.userId,
      product_name: orderData.productName,
      price: orderData.price,
      design_image_url: orderData.designImageUrl || '',
      status: orderData.status,
      customer_info: orderData.customerInfo,
      user_info: {
        firstName: '',
        lastName: '',
        email: orderData.customerInfo.email
      },
      // 添加现有订单都有的字段
      weidian_order_id: null
    };

    console.log('🗄️ [API] 准备保存到数据库的数据:', {
      order_id: dbOrder.order_id,
      user_id: dbOrder.user_id,
      product_name: dbOrder.product_name,
      hasCustomerInfo: !!dbOrder.customer_info
    });

    const { data: savedOrder, error: saveError } = await supabaseAdmin
      .from('orders')
      .insert([dbOrder])
      .select();

    if (saveError) {
      console.error('💥 [API] 数据库保存错误:', {
        error: saveError.message,
        code: saveError.code,
        details: saveError.details
      });
      
      return NextResponse.json(
        { error: 'Failed to save order to database' },
        { status: 500 }
      );
    }

    console.log('✅ [API] 订单成功保存到数据库:', {
      savedOrderCount: savedOrder?.length || 0,
      firstOrderId: savedOrder?.[0]?.order_id,
      firstDbId: savedOrder?.[0]?.id
    });

    const response = {
      success: true,
      message: 'Enhanced pre-order submitted successfully',
      orderId: orderData.id
    };

    console.log('📤 [API] 返回响应:', response);

    return NextResponse.json(response);

  } catch (error) {
    console.error('💥 [API] Enhanced pre-order API 异常:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}