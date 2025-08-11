import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  console.log('🧪 [Test DB] Testing database connection...');
  
  try {
    if (!supabaseAdmin) {
      console.error('❌ [Test DB] supabaseAdmin is null');
      return NextResponse.json({ 
        error: 'Database not configured',
        supabaseAdmin: !!supabaseAdmin 
      }, { status: 500 });
    }

    console.log('📊 [Test DB] Querying orders table...');
    
    // 简单查询测试
    const { data, error, count } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact' })
      .limit(5);

    console.log('📈 [Test DB] Query result:', {
      hasError: !!error,
      dataCount: data?.length || 0,
      totalCount: count,
      errorMessage: error?.message
    });

    if (error) {
      console.error('💥 [Test DB] Database error:', error);
      return NextResponse.json({
        error: 'Database query failed',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      ordersCount: count,
      sampleOrders: data?.map((order: any) => ({
        id: order.id,
        order_id: order.order_id,
        product_name: order.product_name,
        created_at: order.created_at
      })) || []
    });

  } catch (error) {
    console.error('💥 [Test DB] Exception:', error);
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}