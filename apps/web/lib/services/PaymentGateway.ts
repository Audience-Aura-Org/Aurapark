import crypto from 'crypto';
import { PaymentError } from './errors';

interface PaymentInitiation {
    amount: number;
    currency: string;
    reference: string;
    customerEmail: string;
    customerName: string;
    customerPhone: string;
    redirectUrl: string;
    callbackUrl: string;
    metadata?: Record<string, any>;
}

interface PaymentVerification {
    reference: string;
    transactionId: string;
}

interface PaymentRefund {
    transactionId: string;
    amount?: number;
    reason?: string;
}

interface PaymentInitiationResult {
    success: boolean;
    paymentLink: string;
    transactionId: string;
    reference: string;
}

interface PaymentVerificationResult {
    success: boolean;
    transactionId: string;
    reference: string;
    status: string;
    amount: number;
    currency: string;
    customerEmail?: string;
    paymentMethod?: string;
    paidAt?: string;
}

interface PaymentRefundResult {
    success: boolean;
    refundId: string;
    transactionId: string;
    amount: number;
    status: string;
}

interface PaymentStatusResult {
    transactionId: string;
    reference: string;
    status: string;
    amount: number;
    currency: string;
    failureReason?: string;
}

/**
 * Flutterwave Payment Gateway
 * Handles Flutterwave payment operations
 */
export class FlutterwaveGateway {
    private secretKey: string;
    private publicKey: string;
    private baseUrl = 'https://api.flutterwave.com/v3';

    constructor() {
        this.secretKey = process.env.FLUTTERWAVE_SECRET_KEY || '';
        this.publicKey = process.env.FLUTTERWAVE_PUBLIC_KEY || '';

        if (!this.secretKey || !this.publicKey) {
            throw new Error(
                'Flutterwave keys not configured. Set FLUTTERWAVE_SECRET_KEY and FLUTTERWAVE_PUBLIC_KEY'
            );
        }
    }

    /**
     * Initiate a payment with Flutterwave
     */
    async initiatePayment(payment: PaymentInitiation): Promise<PaymentInitiationResult> {
        try {
            const response = await fetch(`${this.baseUrl}/payments`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.secretKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    tx_ref: payment.reference,
                    amount: payment.amount,
                    currency: payment.currency,
                    redirect_url: payment.redirectUrl,
                    customer: {
                        email: payment.customerEmail,
                        name: payment.customerName,
                        phone_number: payment.customerPhone
                    },
                    customizations: {
                        title: 'Aurapark Booking',
                        description: 'Bus booking payment',
                        logo: 'https://aurapark.com/logo.png'
                    },
                    meta: payment.metadata
                })
            });

            const data: any = await response.json();

            if (!response.ok) {
                throw new PaymentError(
                    data.message || 'Payment initiation failed',
                    500,
                    { provider: 'flutterwave', error: data }
                );
            }

            return {
                success: true,
                paymentLink: data.data.link,
                transactionId: data.data.id,
                reference: data.data.tx_ref
            };
        } catch (error: any) {
            if (error instanceof PaymentError) throw error;
            throw new PaymentError(
                'Flutterwave payment initiation failed',
                500,
                { cause: error.message }
            );
        }
    }

    /**
     * Verify a payment with Flutterwave
     */
    async verifyPayment(verification: PaymentVerification): Promise<PaymentVerificationResult> {
        try {
            const response = await fetch(
                `${this.baseUrl}/transactions/${verification.transactionId}/verify`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data: any = await response.json();

            if (!response.ok) {
                throw new PaymentError(
                    'Payment verification failed',
                    500,
                    { provider: 'flutterwave', error: data }
                );
            }

            const transaction = data.data;

            return {
                success: transaction.status === 'successful',
                transactionId: transaction.id,
                reference: transaction.tx_ref,
                amount: transaction.amount,
                currency: transaction.currency,
                status: transaction.status,
                customerEmail: transaction.customer.email,
                paymentMethod: transaction.payment_type,
                paidAt: transaction.created_at
            };
        } catch (error: any) {
            if (error instanceof PaymentError) throw error;
            throw new PaymentError(
                'Flutterwave payment verification failed',
                500,
                { cause: error.message }
            );
        }
    }

    /**
     * Initiate a refund with Flutterwave
     */
    async refund(refund: PaymentRefund): Promise<PaymentRefundResult> {
        try {
            const response = await fetch(
                `${this.baseUrl}/transactions/${refund.transactionId}/refund`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        amount: refund.amount,
                        comments: refund.reason || 'Refund requested'
                    })
                }
            );

            const data: any = await response.json();

            if (!response.ok) {
                throw new PaymentError(
                    data.message || 'Refund failed',
                    500,
                    { provider: 'flutterwave', error: data }
                );
            }

            return {
                success: true,
                refundId: data.data.id,
                transactionId: data.data.transaction_id,
                amount: data.data.amount,
                status: data.data.status
            };
        } catch (error: any) {
            if (error instanceof PaymentError) throw error;
            throw new PaymentError(
                'Flutterwave refund failed',
                500,
                { cause: error.message }
            );
        }
    }

    /**
     * Verify Flutterwave webhook signature
     */
    verifyWebhookSignature(body: string, signature: string): boolean {
        try {
            const hash = crypto
                .createHmac('sha256', this.secretKey)
                .update(body)
                .digest('hex');

            return hash === signature;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get payment status (for polling)
     */
    async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
        try {
            const response = await fetch(
                `${this.baseUrl}/transactions/${transactionId}`,
                {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.secretKey}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const data: any = await response.json();

            if (!response.ok) {
                throw new PaymentError('Failed to get payment status', 500);
            }

            return {
                transactionId: data.data.id,
                reference: data.data.tx_ref,
                status: data.data.status,
                amount: data.data.amount,
                currency: data.data.currency
            };
        } catch (error: any) {
            if (error instanceof PaymentError) throw error;
            throw new PaymentError('Failed to get payment status', 500);
        }
    }
}

/**
 * Stripe Payment Gateway (stub implementation)
 * Ready for expansion
 */
export class StripeGateway {
    private secretKey: string;
    private publishableKey: string;

    constructor() {
        this.secretKey = process.env.STRIPE_SECRET_KEY || '';
        this.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY || '';

        if (!this.secretKey || !this.publishableKey) {
            throw new Error(
                'Stripe keys not configured. Set STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY'
            );
        }
    }

    async initiatePayment(payment: PaymentInitiation): Promise<PaymentInitiationResult> {
        throw new PaymentError('Stripe integration not yet implemented', 501);
    }

    async verifyPayment(verification: PaymentVerification): Promise<PaymentVerificationResult> {
        throw new PaymentError('Stripe integration not yet implemented', 501);
    }

    async refund(refund: PaymentRefund): Promise<PaymentRefundResult> {
        throw new PaymentError('Stripe integration not yet implemented', 501);
    }

    async getPaymentStatus(transactionId: string): Promise<PaymentStatusResult> {
        throw new PaymentError('Stripe integration not yet implemented', 501);
    }

    verifyWebhookSignature(body: string, signature: string): boolean {
        throw new Error('Stripe webhook verification not yet implemented');
    }
}

/**
 * Payment Gateway Factory
 * Selects payment provider based on environment variable
 */
export function getPaymentGateway(): FlutterwaveGateway | StripeGateway {
    const provider = process.env.PAYMENT_GATEWAY || 'flutterwave';

    switch (provider.toLowerCase()) {
        case 'stripe':
            return new StripeGateway();
        case 'flutterwave':
        default:
            return new FlutterwaveGateway();
    }
}

/**
 * Type exports for gateway implementations
 */
export type PaymentGateway = FlutterwaveGateway | StripeGateway;
