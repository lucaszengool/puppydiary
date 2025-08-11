import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    const actualUserId = userId || 'guest';

    const body = await request.json();
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

    if (!productId || !productName || !size || !customerInfo) {
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

    console.log('Enhanced Pre-order received:', orderData);

    return NextResponse.json({
      success: true,
      message: 'Enhanced pre-order submitted successfully',
      orderId: orderData.id
    });

  } catch (error) {
    console.error('Enhanced pre-order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}