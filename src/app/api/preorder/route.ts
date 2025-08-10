import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, productName, price, designImageUrl, customerInfo } = body;

    // Get user info from Clerk
    const user = await clerkClient.users.getUser(userId);

    // Here you would typically save to database
    // For now, we'll just send an email confirmation
    
    const preOrderData = {
      orderId: `PO-${Date.now()}-${userId.slice(-4)}`,
      userId,
      productId,
      productName,
      price,
      designImageUrl,
      customerInfo,
      userInfo: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.emailAddresses[0]?.emailAddress
      },
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    // Send confirmation email
    await sendPreOrderConfirmation(preOrderData);

    return NextResponse.json({ 
      success: true, 
      orderId: preOrderData.orderId,
      message: 'Pre-order submitted successfully' 
    });

  } catch (error) {
    console.error('Pre-order API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendPreOrderConfirmation(orderData: any) {
  // Email configuration
  const emailData = {
    to: orderData.customerInfo.email,
    subject: `预订确认 - ${orderData.productName} (订单号: ${orderData.orderId})`,
    html: `
      <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
        <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #333; font-size: 24px; font-weight: 300; margin: 0;">PETPO</h1>
            <p style="color: #666; font-size: 14px; margin: 5px 0 0 0;">个性化宠物艺术品</p>
          </div>
          
          <div style="background: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 25px;">
            <h2 style="color: #333; font-size: 18px; margin: 0 0 15px 0;">预订确认</h2>
            <p style="color: #666; line-height: 1.5; margin: 0;">
              感谢您预订我们的个性化${orderData.productName}！您的订单已成功提交。
            </p>
          </div>
          
          <div style="border-left: 4px solid #007acc; padding-left: 20px; margin-bottom: 25px;">
            <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0;">订单详情</h3>
            <p style="color: #666; margin: 5px 0;"><strong>订单号:</strong> ${orderData.orderId}</p>
            <p style="color: #666; margin: 5px 0;"><strong>产品:</strong> ${orderData.productName}</p>
            <p style="color: #666; margin: 5px 0;"><strong>价格:</strong> ¥${orderData.price}</p>
            <p style="color: #666; margin: 5px 0;"><strong>下单时间:</strong> ${new Date(orderData.createdAt).toLocaleString('zh-CN')}</p>
          </div>
          
          <div style="border-left: 4px solid #28a745; padding-left: 20px; margin-bottom: 25px;">
            <h3 style="color: #333; font-size: 16px; margin: 0 0 10px 0;">收货信息</h3>
            <p style="color: #666; margin: 5px 0;"><strong>姓名:</strong> ${orderData.customerInfo.name}</p>
            <p style="color: #666; margin: 5px 0;"><strong>电话:</strong> ${orderData.customerInfo.phone}</p>
            <p style="color: #666; margin: 5px 0;"><strong>地址:</strong> ${orderData.customerInfo.address}</p>
          </div>
          
          <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin-bottom: 25px;">
            <h3 style="color: #856404; font-size: 14px; margin: 0 0 8px 0;">📦 关于预售</h3>
            <p style="color: #856404; font-size: 13px; line-height: 1.4; margin: 0;">
              这是预售商品，我们正在与厂商协商生产事宜。一旦确定生产计划，我们会第一时间通知您并安排发货。预计处理时间为2-4周。
            </p>
          </div>
          
          <div style="text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px; margin: 0;">
              如有任何问题，请随时联系我们的客服团队
            </p>
            <p style="color: #666; font-size: 13px; margin: 10px 0 0 0;">
              感谢您选择 PETPO！
            </p>
          </div>
        </div>
      </div>
    `
  };

  // Here you would integrate with your email service (SendGrid, Resend, etc.)
  // For demo purposes, we'll just log the email data
  console.log('📧 Pre-order confirmation email:', emailData);
  
  // Simulate email sending delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return true;
}