// Stub: Razorpay / Stripe payment integration
// Replace with actual SDK calls once keys are configured.

import logger from '../utils/logger.js';

export const createPaymentOrder = async ({ amount, currency = 'INR', receipt }) => {
    logger.warn('Payment service is a stub. Configure Razorpay/Stripe keys.');
    // Razorpay example:
    // const Razorpay = await import('razorpay');
    // const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    // return instance.orders.create({ amount: amount * 100, currency, receipt });
    return { id: `stub_order_${Date.now()}`, amount, currency, receipt, status: 'created' };
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
    logger.warn('Payment signature verification is a stub.');
    // Implement HMAC-SHA256 verification here
    return true;
};

export const refundPayment = async ({ paymentId, amount }) => {
    logger.warn('Refund is a stub.');
    return { id: `stub_refund_${Date.now()}`, paymentId, amount, status: 'processed' };
};
