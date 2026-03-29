// Razorpay payment integration with demo-mode fallback
import crypto from 'crypto';
import logger from '../utils/logger.js';

let razorpayInstance = null;

const isConfigured = () => !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const getInstance = async () => {
    if (!isConfigured()) return null;
    if (!razorpayInstance) {
        const Razorpay = (await import('razorpay')).default;
        razorpayInstance = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    return razorpayInstance;
};

export const createPaymentOrder = async ({ amount, currency = 'INR', receipt, notes = {} }) => {
    const instance = await getInstance();
    if (!instance) {
        logger.warn('[Payment] Running in DEMO mode — no Razorpay keys configured.');
        return {
            id: `demo_order_${Date.now()}`,
            amount: amount * 100,
            currency,
            receipt,
            status: 'created',
            demo: true,
        };
    }
    const order = await instance.orders.create({
        amount: amount * 100, // Razorpay expects paise
        currency,
        receipt,
        notes,
    });
    logger.info(`[Payment] Razorpay order created: ${order.id}`);
    return order;
};

export const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
    if (!isConfigured()) {
        logger.warn('[Payment] DEMO mode — skipping signature verification.');
        return true;
    }
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest('hex');
    return expectedSignature === signature;
};

export const refundPayment = async ({ paymentId, amount }) => {
    const instance = await getInstance();
    if (!instance) {
        logger.warn('[Payment] DEMO mode — simulating refund.');
        return { id: `demo_refund_${Date.now()}`, paymentId, amount, status: 'processed' };
    }
    const refund = await instance.payments.refund(paymentId, { amount: amount * 100 });
    logger.info(`[Payment] Refund processed: ${refund.id}`);
    return refund;
};

export const isDemoMode = () => !isConfigured();
