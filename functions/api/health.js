/**
 * Health check endpoint for monitoring.
 * Reports Cloudflare Functions status and configured integrations.
 */

export async function onRequest(context) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (context.request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        functions: {
          status: 'operational',
          message: 'Cloudflare Functions are running',
        },
      },
      environment: {
        hasKV: !!context.env.MIMENU_KV,
        hasSessionSecret: !!context.env.APP_SESSION_SECRET,
        hasResendKey: !!context.env.RESEND_API_KEY,
        hasArWorker: !!context.env.AR_WORKER_URL,
      },
    };

    const statusCode = health.status === 'healthy' ? 200 : 503;

    return new Response(JSON.stringify(health, null, 2), {
      status: statusCode,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Health check error:', error);

    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
