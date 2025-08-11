import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🟢 Test API GET called');
  return NextResponse.json({ message: 'Test API working!', timestamp: new Date().toISOString() });
}