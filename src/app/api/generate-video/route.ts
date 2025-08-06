import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs'

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

    // 使用您提供的API密钥
    const ARK_API_KEY = "d02d7827-d0c9-4e86-b99b-ba1952eeb25d"

    // 创建视频生成任务 - 使用正确的API格式
    console.log('Creating video with prompt:', prompt)
    console.log('Using first image:', images[0])
    
    const requestBody = {
      model: 'doubao-seedance-1-0-pro-250528', // 使用正确的模型ID
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
      console.error('Video generation error:', createResponse.status, errorText)
      return NextResponse.json({ 
        error: `视频生成请求失败: ${createResponse.status}`, 
        details: errorText 
      }, { status: createResponse.status })
    }

    const createResult = await createResponse.json()
    console.log('Video creation result:', createResult)
    
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

    // 使用您提供的API密钥
    const ARK_API_KEY = "d02d7827-d0c9-4e86-b99b-ba1952eeb25d"

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