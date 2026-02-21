/**
 * Payment Gateway Abstraction Layer
 * Supports multiple providers: Flutterwave, Stripe
 * Reduces coupling and allows easy provider switching
 */

export interface PaymentInitiateParams {
  bookingId: string;
  amount: number;
  currency?: string;
  customerEmail: string;
  customerPhone: string;
  customerName: string;
  metadata?: Record<string, any>;
}

export interface PaymentVerifyParams {
  transactionId: string;
  reference: string;
}

export interface PaymentRefundParams {
  transactionId: string;
  amount: number;
}

export interface PaymentInitiateResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  paymentLink?: string;
  redirectUrl?: string;
  error?: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  amount: number;
  currency: string;
  reference: string;
  transactionId: string;
  error?: string;
}

export interface PaymentRefundResponse {
  success: boolean;
  refundId: string;
  amount: number;
  status: 'INITIATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

/**
 * Base Payment Gateway Interface
 */
export interface IPaymentGateway {
  initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResponse>;
  verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResponse>;
  refund(params: PaymentRefundParams): Promise<PaymentRefundResponse>;
  verifyWebhookSignature(payload: any, signature: string): boolean;
}

/**
 * Flutterwave Payment Gateway Implementation
 */
export class FlutterwaveGateway implements IPaymentGateway {
  private publicKey: string;
  private secretKey: string;
  private apiBase: string = 'https://api.flutterwave.com/v3';

  constructor() {
    this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY || '';
    this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';

    if (!this.publicKey || !this.secretKey) {
      throw new Error('Flutterwave API keys not configured');
    }
  }

  async initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResponse> {
    try {
      const payload = {
        tx_ref: `aura_${params.bookingId}_${Date.now()}`,
        amount: params.amount,
        currency: params.currency || 'XAF',
        redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
        customer: {
          email: params.customerEmail,
          phone_number: params.customerPhone,
          name: params.customerName
        },
        customizations: {
          title: 'Aurapark Transport',
          description: `Booking: ${params.bookingId}`,
          logo: `${process.env.NEXT_PUBLIC_APP_URL}/logo-black.png`
        },
        meta: {
          bookingId: params.bookingId,
          ...params.metadata
        }
      };

      const response = await fetch(`${this.apiBase}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.status || data.status !== 'success') {
        return {
          success: false,
          error: data.message || 'Payment initiation failed',
          transactionId: '',
          reference: ''
        };
      }

      return {
        success: true,
        transactionId: data.data.id.toString(),
        reference: data.data.tx_ref,
        paymentLink: data.data.link,
        redirectUrl: data.data.link
      };
    } catch (error: any) {
      console.error('Flutterwave initiatePayment error:', error);
      return {
        success: false,
        error: error.message,
        transactionId: '',
        reference: ''
      };
    }
  }

  async verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResponse> {
    try {
      const response = await fetch(
        `${this.apiBase}/transactions/${params.transactionId}/verify`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.secretKey}`
          }
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status || data.status !== 'success') {
        return {
          success: false,
          error: data.message || 'Verification failed',
          status: 'FAILED',
          amount: 0,
          currency: '',
          reference: params.reference,
          transactionId: params.transactionId
        };
      }

      const paymentStatus =
        data.data.status === 'successful'
          ? 'COMPLETED'
          : data.data.status === 'pending'
          ? 'PENDING'
          : 'FAILED';

      return {
        success: paymentStatus === 'COMPLETED',
        status: paymentStatus,
        amount: data.data.amount,
        currency: data.data.currency,
        reference: data.data.tx_ref,
        transactionId: data.data.id.toString()
      };
    } catch (error: any) {
      console.error('Flutterwave verifyPayment error:', error);
      return {
        success: false,
        error: error.message,
        status: 'FAILED',
        amount: 0,
        currency: '',
        reference: params.reference,
        transactionId: params.transactionId
      };
    }
  }

  async refund(params: PaymentRefundParams): Promise<PaymentRefundResponse> {
    try {
      const response = await fetch(
        `${this.apiBase}/transactions/${params.transactionId}/refund`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount: params.amount })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.status || data.status !== 'success') {
        return {
          success: false,
          error: data.message || 'Refund failed',
          refundId: '',
          amount: params.amount,
          status: 'FAILED'
        };
      }

      return {
        success: true,
        refundId: data.data.id.toString(),
        amount: params.amount,
        status: 'INITIATED'
      };
    } catch (error: any) {
      console.error('Flutterwave refund error:', error);
      return {
        success: false,
        error: error.message,
        refundId: '',
        amount: params.amount,
        status: 'FAILED'
      };
    }
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    try {
      const crypto = require('crypto');
      const hash = crypto
        .createHash('sha256')
        .update(JSON.stringify(payload) + this.secretKey)
        .digest('hex');

      return hash === signature;
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }
}

/**
 * Stripe Payment Gateway Implementation (Stub - can be expanded)
 */
export class StripeGateway implements IPaymentGateway {
  private secretKey: string;

  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY || '';
    if (!this.secretKey) {
      throw new Error('Stripe API key not configured');
    }
  }

  async initiatePayment(params: PaymentInitiateParams): Promise<PaymentInitiateResponse> {
    // TODO: Implement Stripe payment initiation
    throw new Error('Stripe integration not yet implemented');
  }

  async verifyPayment(params: PaymentVerifyParams): Promise<PaymentVerifyResponse> {
    // TODO: Implement Stripe payment verification
    throw new Error('Stripe integration not yet implemented');
  }

  async refund(params: PaymentRefundParams): Promise<PaymentRefundResponse> {
    // TODO: Implement Stripe refunds
    throw new Error('Stripe integration not yet implemented');
  }

  verifyWebhookSignature(payload: any, signature: string): boolean {
    // TODO: Implement Stripe webhook verification
    return false;
  }
}

/**
 * Factory for getting payment gateway instance
 */
export function getPaymentGateway(): IPaymentGateway {
  const provider = process.env.PAYMENT_GATEWAY || 'flutterwave';

  switch (provider) {
    case 'flutterwave':
      return new FlutterwaveGateway();
    case 'stripe':
      return new StripeGateway();
    default:
      throw new Error(`Unknown payment gateway: ${provider}`);
  }
}
