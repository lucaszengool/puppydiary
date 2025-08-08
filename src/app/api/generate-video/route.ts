import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Specify Node.js runtime to avoid Edge Runtime issues
export const runtime = 'nodejs'

interface VideoGenerationRequest {
  images: string[]
  prompt?: string
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = auth()
    
    const body: VideoGenerationRequest = await req.json()
    const { images, prompt = "温馨的狗狗日记视频，宫崎骏风格动画" } = body

    if (!images || images.length < 3) {
      return NextResponse.json({ error: '需要至少3张图片生成视频' }, { status: 400 })
    }

    // 从环境变量获取API密钥 - 视频生成使用专门的ARK_API_KEY
    const ARK_API_KEY = process.env.ARK_API_KEY || ""
    
    console.log('🔑 [VIDEO API DEBUG] ARK_API_KEY status:', {
      hasKey: !!ARK_API_KEY,
      isPlaceholder: ARK_API_KEY === "your-ark-api-key-here",
      keyLength: ARK_API_KEY?.length || 0,
      keyPreview: ARK_API_KEY?.substring(0, 10) + '...'
    })
    
    if (!ARK_API_KEY || ARK_API_KEY === "your-ark-api-key-here") {
      return NextResponse.json({ 
        error: '视频生成服务未配置', 
        details: '需要在环境变量中配置有效的ARK_API_KEY才能使用视频生成功能。请联系管理员配置火山引擎API密钥。',
        debug: {
          hasKey: !!ARK_API_KEY,
          isPlaceholder: ARK_API_KEY === "your-ark-api-key-here"
        }
      }, { status: 503 })
    }

    // 检查第一张图片是否为base64数据URL
    const firstImage = images[0]
    if (firstImage.startsWith('data:')) {
      return NextResponse.json({ 
        error: '视频生成需要公开可访问的图片URL，当前生成的图片为本地数据。请考虑配置图片云存储服务。',
        details: 'Base64 data URLs cannot be processed by the video generation API. Need publicly accessible image URLs.'
      }, { status: 400 })
    }

    console.log('First image URL:', firstImage.substring(0, 100) + '...')

    // 创建视频生成任务 - 使用正确的API格式
    console.log('Creating video with prompt:', prompt)
    console.log('Using first image:', images[0])
    
    const requestBody = {
      model: 'ep-20250808201258-h59fq', // 使用正确的端点ID
      content: [
        {
          type: 'text',
          text: `${prompt} --resolution 1080p --duration 5 --camerafixed false --watermark true`
        },
        {
          type: 'image_url',
          image_url: {
            url: images[0] // 使用第一张图片作为首帧
          }
        }
      ]
    }
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2))
    
    console.log('🎬 [VIDEO API DEBUG] Making request to Volcengine:', {
      endpoint: 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks',
      model: requestBody.model,
      hasAuthHeader: !!ARK_API_KEY,
      imageUrl: images[0]?.substring(0, 100) + '...'
    })
    
    const createResponse = await fetch('https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`,
      },
      body: JSON.stringify(requestBody)
    })

    if (!createResponse.ok) {
      const errorText = await createResponse.text()
      console.error('🚨 [VIDEO API DEBUG] Video generation error:', {
        status: createResponse.status,
        statusText: createResponse.statusText,
        errorText,
        headers: Object.fromEntries(createResponse.headers.entries())
      })
      return NextResponse.json({ 
        error: `视频生成请求失败: ${createResponse.status}`, 
        details: errorText,
        debug: {
          status: createResponse.status,
          statusText: createResponse.statusText,
          endpoint: 'https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks',
          model: 'ep-20250808201258-h59fq'
        }
      }, { status: createResponse.status })
    }

    const createResult = await createResponse.json()
    console.log('✅ [VIDEO API DEBUG] Video creation result:', {
      hasId: !!createResult.id,
      status: createResult.status,
      fullResponse: createResult
    })
    
    const taskId = createResult.id

    // 返回任务ID，前端可以用来轮询状态
    return NextResponse.json({
      taskId,
      status: 'processing',
      message: '视频生成任务已创建，请等待处理...'
    })

  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json({ 
      error: '视频生成失败', 
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}

// 查询视频生成任务状态
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const taskId = searchParams.get('taskId')

    if (!taskId) {
      return NextResponse.json({ error: '缺少taskId参数' }, { status: 400 })
    }

    // 从环境变量获取API密钥
    const ARK_API_KEY = process.env.ARK_API_KEY || ""
    
    if (!ARK_API_KEY || ARK_API_KEY === "your-ark-api-key-here") {
      return NextResponse.json({ 
        error: '视频生成服务未配置', 
        details: '需要在环境变量中配置有效的ARK_API_KEY才能使用视频生成功能。请联系管理员配置火山引擎API密钥。',
        debug: {
          hasKey: !!ARK_API_KEY,
          isPlaceholder: ARK_API_KEY === "your-ark-api-key-here"
        }
      }, { status: 503 })
    }

    const response = await fetch(`https://ark.cn-beijing.volces.com/api/v3/contents/generations/tasks/${taskId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ARK_API_KEY}`,
      }
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Status check error:', response.status, errorText)
      return NextResponse.json({ 
        error: '查询任务状态失败',
        details: errorText
      }, { status: response.status })
    }

    const result = await response.json()
    console.log('Status check result:', result)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Video status check error:', error)
    return NextResponse.json({ 
      error: '查询视频状态失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
}