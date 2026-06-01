import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
      next: { revalidate: 86400 } // Cache image on Next.js server for 24 hours
    });

    if (!response.ok) {
      return new NextResponse('Failed to fetch remote image', { status: response.status });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400', // Cache for 7 days, refresh in background after 24h
      },
    });
  } catch (error: any) {
    console.error('Image proxy error:', error);
    return new NextResponse(`Internal Server Error: ${error.message}`, { status: 500 });
  }
}
