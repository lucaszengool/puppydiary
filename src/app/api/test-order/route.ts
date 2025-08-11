import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  console.log('🧪 [Test Order] 开始测试订单保存...');
  
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    console.log('📦 [Test Order] 接收数据:', body);

    // 使用最简单的字段结构，完全匹配现有订单
    const testOrder = {
      order_id: `test-${Date.now()}-simple`,
      user_id: 'guest',
      product_name: '简化测试订单',
      price: 99,
      design_image_url: 'https://placehold.co/300x300/green/white?text=Simple+Test',
      status: 'pending',
      customer_info: {
        name: '简化测试用户',
        email: 'simple-test@example.com',
        phone: '13800138000',
        address: '简化测试地址'
      },
      user_info: {
        firstName: '',
        lastName: '',
        email: 'simple-test@example.com'
      },
      weidian_order_id: null
    };

    console.log('💾 [Test Order] 尝试保存:', testOrder);

    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([testOrder])
      .select();

    if (error) {
      console.error('❌ [Test Order] 保存失败:', error);
      return NextResponse.json({ 
        error: 'Save failed',
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    console.log('✅ [Test Order] 保存成功:', data);

    return NextResponse.json({
      success: true,
      message: 'Test order saved successfully',
      data: data
    });

  } catch (error) {
    console.error('💥 [Test Order] 异常:', error);
    return NextResponse.json({
      error: 'Internal error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}