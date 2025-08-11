import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';
import crypto from 'crypto';

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

    // Create order data
    const preOrderData: any = {
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
      status: 'pending',
      weidianOrderId: null // Will be set if Weidian order is created successfully
    };

    // 保存订单到 Clerk 用户元数据
    try {
      await saveOrderToClerk(userId, preOrderData);
      console.log('✅ Order saved to Clerk');
    } catch (error) {
      console.error('Failed to save order to Clerk:', error);
    }

    // Send to Weidian (微店) - 可选
    if (process.env.WEIDIAN_APP_KEY && process.env.WEIDIAN_APP_SECRET) {
      try {
        // 创建微店订单
        const weidianOrder = await createWeidianOrder(preOrderData);
        console.log('✅ Order created in Weidian:', weidianOrder);
        
        // 如果微店订单创建成功，保存微店订单号
        if (weidianOrder && weidianOrder.order_id) {
          preOrderData.weidianOrderId = weidianOrder.order_id;
        }
      } catch (error) {
        console.error('Failed to create Weidian order:', error);
        // 即使微店创建失败，也继续处理（发送邮件等）
      }
    } else {
      console.log('⚠️ Weidian API credentials not configured, using Clerk storage only');
    }

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

// 保存订单到 Clerk 用户元数据
async function saveOrderToClerk(userId: string, orderData: any) {
  try {
    // 获取用户当前的私有元数据
    const user = await clerkClient.users.getUser(userId);
    const currentMetadata = user.privateMetadata || {};
    const existingOrders = currentMetadata.orders;
    
    // 确保 orders 是数组
    const orders = Array.isArray(existingOrders) ? existingOrders : [];
    
    // 添加新订单
    orders.push({
      ...orderData,
      id: orderData.orderId,
      createdAt: orderData.createdAt,
      updatedAt: new Date().toISOString()
    });
    
    // 更新用户元数据
    await clerkClient.users.updateUser(userId, {
      privateMetadata: {
        ...currentMetadata,
        orders: orders,
        totalOrders: orders.length,
        lastOrderDate: new Date().toISOString()
      }
    });
    
    console.log(`✅ Order ${orderData.orderId} saved to Clerk for user ${userId}`);
  } catch (error) {
    console.error('Error saving order to Clerk:', error);
    throw error;
  }
}

// 微店API集成
async function createWeidianOrder(orderData: any) {
  const appKey = process.env.WEIDIAN_APP_KEY!;
  const appSecret = process.env.WEIDIAN_APP_SECRET!;
  const shopId = process.env.WEIDIAN_SHOP_ID || '';
  
  // 微店API参数
  const method = 'vdian.order.create';
  const format = 'json';
  const version = '1.0';
  const timestamp = new Date().toISOString();
  
  // 构建订单数据
  const orderParams = {
    buyer_info: {
      name: orderData.customerInfo.name,
      phone: orderData.customerInfo.phone,
      address: orderData.customerInfo.address,
      email: orderData.customerInfo.email
    },
    items: [{
      item_name: orderData.productName,
      price: orderData.price,
      quantity: 1,
      item_id: getWeidianItemId(orderData.productName), // 根据产品名称获取微店商品ID
      sku_id: getWeidianSkuId(orderData.productName), // 根据产品获取SKU ID
      item_image: orderData.designImageUrl
    }],
    order_type: 'custom', // 定制订单
    note: `定制订单 - ${orderData.orderId}\n设计图: ${orderData.designImageUrl}\n${orderData.customerInfo.notes || ''}`,
    total_price: orderData.price,
    express_fee: 0, // 包邮
    shop_id: shopId
  };
  
  // 生成签名
  const sign = generateWeidianSign({
    method,
    app_key: appKey,
    format,
    version,
    timestamp,
    ...orderParams
  }, appSecret);
  
  // 调用微店API
  try {
    const response = await fetch('https://api.vdian.com/api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        method,
        access_token: await getWeidianAccessToken(), // 获取access token
        version,
        format,
        timestamp,
        sign,
        ...orderParams
      })
    });
    
    const result = await response.json();
    
    if (result.status && result.status.status_code === 0) {
      return result.result;
    } else {
      console.error('Weidian API error:', result);
      throw new Error(result.status?.status_reason || 'Failed to create Weidian order');
    }
  } catch (error) {
    console.error('Error calling Weidian API:', error);
    throw error;
  }
}

// 生成微店API签名
function generateWeidianSign(params: any, appSecret: string): string {
  // 按照微店要求排序参数并生成签名
  const sortedKeys = Object.keys(params).sort();
  let signString = appSecret;
  
  for (const key of sortedKeys) {
    if (params[key] !== undefined && params[key] !== null) {
      signString += key + JSON.stringify(params[key]);
    }
  }
  
  signString += appSecret;
  
  // 使用MD5生成签名
  return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
}

// 获取微店Access Token (实际应该缓存token，这里简化处理)
async function getWeidianAccessToken(): Promise<string> {
  // 如果已配置固定token，直接使用
  if (process.env.WEIDIAN_ACCESS_TOKEN) {
    return process.env.WEIDIAN_ACCESS_TOKEN;
  }
  
  // 否则通过OAuth获取token
  const appKey = process.env.WEIDIAN_APP_KEY!;
  const appSecret = process.env.WEIDIAN_APP_SECRET!;
  
  const response = await fetch('https://oauth.vdian.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: appKey,
      client_secret: appSecret
    })
  });
  
  const data = await response.json();
  return data.access_token;
}

// 根据产品名称获取微店商品ID（需要预先在微店创建商品）
function getWeidianItemId(productName: string): string {
  // 根据产品类型返回对应的微店商品ID
  if (productName.includes('卫衣')) {
    // 卫衣 - 99元
    return process.env.WEIDIAN_ITEM_ID_HOODIE || '1234567890';
  } else if (productName.includes('短袖') || productName.includes('T恤')) {
    // 短袖T恤 - 49元
    return process.env.WEIDIAN_ITEM_ID_TSHIRT || '1234567891';
  }
  
  // 默认返回卫衣ID
  return process.env.WEIDIAN_ITEM_ID_HOODIE || '1234567890';
}

// 根据产品规格获取SKU ID
function getWeidianSkuId(productName: string): string {
  // 提取尺码信息 - 支持 "S", "M", "L", "XL" 或 "S码", "M码" 等格式
  const sizeMatch = productName.match(/\b([SML]|XL)\b/);
  const size = sizeMatch ? sizeMatch[1] : 'M';
  
  // 判断是卫衣还是T恤
  const isHoodie = productName.includes('卫衣');
  
  // 根据产品类型和尺码返回对应的SKU ID
  if (isHoodie) {
    const skuMap: { [key: string]: string } = {
      'S': process.env.WEIDIAN_HOODIE_SKU_S || 'hoodie_sku_s',
      'M': process.env.WEIDIAN_HOODIE_SKU_M || 'hoodie_sku_m',
      'L': process.env.WEIDIAN_HOODIE_SKU_L || 'hoodie_sku_l',
      'XL': process.env.WEIDIAN_HOODIE_SKU_XL || 'hoodie_sku_xl',
    };
    return skuMap[size] || skuMap['M'];
  } else {
    const skuMap: { [key: string]: string } = {
      'S': process.env.WEIDIAN_TSHIRT_SKU_S || 'tshirt_sku_s',
      'M': process.env.WEIDIAN_TSHIRT_SKU_M || 'tshirt_sku_m',
      'L': process.env.WEIDIAN_TSHIRT_SKU_L || 'tshirt_sku_l',
      'XL': process.env.WEIDIAN_TSHIRT_SKU_XL || 'tshirt_sku_xl',
    };
    return skuMap[size] || skuMap['M'];
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
            ${orderData.weidianOrderId ? `<p style="color: #666; margin: 5px 0;"><strong>微店订单号:</strong> ${orderData.weidianOrderId}</p>` : ''}
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