// Mock MercadoPago service for testing when API is not accessible
import QRCode from 'qrcode';
import type { PaymentRequest, PaymentResponse, PaymentStatus } from './client';

class MockMercadoPagoService {
  /**
   * Create a mock payment for testing
   */
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Generate mock data
    const mockPaymentId = `mock_${Date.now()}`;
    const mockQrCode = `00020100QR-SIMPLE-BOLIVIA-DEV-${mockPaymentId}`;
    
    try {
      // Generate proper QR code
      const qrCodeDataURL = await QRCode.toDataURL(mockQrCode, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      // Extract base64 from data URL
      const mockQRCodeBase64 = qrCodeDataURL.split(',')[1];

      return {
        id: mockPaymentId,
        status: 'pending',
        qrCode: mockQrCode,
        qrCodeBase64: mockQRCodeBase64,
        pixCopyPaste: mockQrCode,
        expirationDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        transactionAmount: paymentData.amount
      };
    } catch (error) {
      console.error('Error generating QR code:', error);
      
      // Fallback to simple base64 placeholder
      const mockQRCodeBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";

      return {
        id: mockPaymentId,
        status: 'pending',
        qrCode: mockQrCode,
        qrCodeBase64: mockQRCodeBase64,
        pixCopyPaste: mockQrCode,
        expirationDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        transactionAmount: paymentData.amount
      };
    }
  }

  /**
   * Check mock payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Extract timestamp from mock payment ID
    const timestamp = paymentId.replace('mock_', '');
    const paymentAge = Date.now() - parseInt(timestamp);
    
    // Auto-approve mock payments after 10 seconds for testing
    const isApproved = paymentAge > 10000; // 10 seconds

    console.log('Mock payment check:', { paymentId, paymentAge, isApproved });

    return {
      id: paymentId,
      status: isApproved ? 'approved' : 'pending',
      statusDetail: isApproved ? 'accredited' : 'pending_waiting_payment',
      transactionAmount: 0.50,
      dateCreated: new Date(parseInt(timestamp)).toISOString(),
      dateApproved: isApproved ? new Date().toISOString() : undefined
    };
  }

  /**
   * Process mock webhook
   */
  async processWebhook(webhookData: any): Promise<{ orderId: string; status: string; paymentId: string }> {
    return {
      orderId: webhookData.external_reference || '',
      status: 'approved',
      paymentId: webhookData.data?.id || 'mock_payment'
    };
  }

  /**
   * Validate webhook signature (always true for mock)
   */
  validateWebhookSignature(payload: string, signature: string): boolean {
    return true;
  }
}

export const mockMercadoPagoService = new MockMercadoPagoService();