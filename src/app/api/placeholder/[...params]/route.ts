import { NextRequest } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { params: string[] } }
) {
  const [width, height] = params.params;
  const { searchParams } = new URL(request.url);
  
  const text = searchParams.get('text') || 'Placeholder';
  const bg = searchParams.get('bg') || '007acc';
  
  const widthNum = parseInt(width) || 400;
  const heightNum = parseInt(height) || 400;
  
  const svg = `<svg width="${widthNum}" height="${heightNum}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${widthNum}" height="${heightNum}" fill="#${bg}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" dy=".3em">
      ${text}
    </text>
  </svg>`;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600'
    },
  });
}