import { NextRequest } from 'next/server';
import http from 'http';
import https from 'https';
import { URL } from 'url';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * SSE Proxy Route
 *
 * Next.js `rewrites` buffers responses and breaks SSE long-lived connections.
 * This route handler uses Node.js native http/https to pipe the backend SSE
 * stream directly to a ReadableStream returned to the browser client.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');

  if (!token) {
    return new Response(JSON.stringify({ message: 'Authentication required' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const backendBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const rawUrl = `${backendBase}/sse/admin?token=${encodeURIComponent(token)}`;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid backend URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const isHttps = parsedUrl.protocol === 'https:';
  const transport = isHttps ? https : http;

  // Create a ReadableStream that pipes the backend SSE response
  const stream = new ReadableStream({
    start(controller) {
      const options: http.RequestOptions = {
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (isHttps ? 443 : 80),
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      };

      const req = transport.request(options, (res) => {
        if (res.statusCode !== 200) {
          // Forward error status from backend
          let body = '';
          res.on('data', (chunk: Buffer) => { body += chunk.toString(); });
          res.on('end', () => {
            controller.error(new Error(`Backend returned ${res.statusCode}: ${body}`));
          });
          return;
        }

        res.on('data', (chunk: Buffer) => {
          try {
            controller.enqueue(new Uint8Array(chunk));
          } catch {
            // Controller already closed (client disconnected)
          }
        });

        res.on('end', () => {
          try { controller.close(); } catch { /* already closed */ }
        });

        res.on('error', (err) => {
          console.error('[SSE Proxy] Backend stream error:', err.message);
          try { controller.error(err); } catch { /* already errored */ }
        });
      });

      req.on('error', (err) => {
        console.error('[SSE Proxy] Connection to backend failed:', err.message);
        try { controller.error(err); } catch { /* already errored */ }
      });

      req.end();

      // When client disconnects, abort the backend request
      request.signal.addEventListener('abort', () => {
        req.destroy();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
