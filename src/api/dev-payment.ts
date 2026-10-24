// Development-only payment endpoint
// This runs locally via Vite's proxy
export async function POST(request: Request) {
  try {
    const paymentData = await request.json();
    
    // Mock payment response for local development (Bolivia-flavored QR Simple placeholder)
    const mockQrPayload = `00020100QR-SIMPLE-BOLIVIA-DEV-${Date.now()}`;
    const mockResponse = {
      id: `dev_${Date.now()}`,
      status: 'pending',
      qrCode: mockQrPayload,
      qrCodeBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      pixCopyPaste: mockQrPayload,
      expirationDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      transactionAmount: paymentData.amount,
      _isDev: true
    };

    return new Response(JSON.stringify(mockResponse), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Payment creation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
