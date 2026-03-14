import Payment from './payment.model.js';
import * as paymentGateway from '../../integrations/payment.service.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';

export const createOrder = async (payerId, { payee, amount, currency, job, project, description }) => {
    const order = await paymentGateway.createPaymentOrder({ amount, currency, receipt: `order_${Date.now()}` });
    const payment = await Payment.create({
        payer: payerId, payee, amount, currency, job, project, description,
        providerOrderId: order.id, status: 'pending',
    });
    return { payment, order };
};

export const verifyPayment = async (paymentId, { orderId, paymentId: provId, signature }) => {
    const isValid = paymentGateway.verifyPaymentSignature({ orderId, paymentId: provId, signature });
    if (!isValid) { const e = new Error('Invalid payment signature'); e.statusCode = 400; throw e; }
    return Payment.findByIdAndUpdate(paymentId, { status: 'completed', providerId: provId }, { new: true });
};

export const listPayments = async (userId, query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const filter = { payer: userId };
    const [payments, total] = await Promise.all([Payment.find(filter).sort(sort).skip(skip).limit(limit), Payment.countDocuments(filter)]);
    return { payments, pagination: buildPaginationMeta(total, page, limit) };
};
