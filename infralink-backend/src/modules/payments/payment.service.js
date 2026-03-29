import mongoose from 'mongoose';
import Payment from './payment.model.js';
import * as paymentGateway from '../../integrations/payment.service.js';
import { getPagination, buildPaginationMeta } from '../../utils/pagination.utils.js';
import User from '../users/user.model.js';
import logger from '../../utils/logger.js';

export const createOrder = async (payerId, { payeeEmail, amount, currency = 'INR', job, project, description }) => {
    // Find payee by email
    let payee = null;
    if (payeeEmail) {
        payee = await User.findOne({ email: payeeEmail });
        if (!payee) {
            const e = new Error('Payee not found with that email');
            e.statusCode = 404;
            throw e;
        }
    }

    const receipt = `rcpt_${Date.now()}`;
    console.log('--- DEBUG INFO ---');
    console.log('paymentGateway:', paymentGateway);
    console.log('Payment:', Payment);
    console.log('------------------');
    
    const order = await paymentGateway.createPaymentOrder({
        amount,
        currency,
        receipt,
        notes: { payerId: payerId.toString(), payeeId: payee?._id?.toString(), description },
    });

    const payment = await Payment.create({
        payer: payerId,
        payee: payee?._id || payerId,
        amount,
        currency,
        job: job || undefined,
        project: project || undefined,
        description: description || '',
        providerOrderId: order.id,
        provider: order.demo ? 'manual' : 'razorpay',
        status: 'pending',
    });

    return {
        payment,
        order,
        keyId: process.env.RAZORPAY_KEY_ID || null,
        demo: !!order.demo,
    };
};

export const verifyPayment = async (paymentId, { orderId, razorpayPaymentId, signature }) => {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
        const e = new Error('Payment not found');
        e.statusCode = 404;
        throw e;
    }

    // Demo mode — auto-complete
    if (payment.provider === 'manual') {
        payment.status = 'completed';
        payment.providerId = `demo_pay_${Date.now()}`;
        await payment.save();
        return payment;
    }

    const isValid = paymentGateway.verifyPaymentSignature({
        orderId,
        paymentId: razorpayPaymentId,
        signature,
    });

    if (!isValid) {
        payment.status = 'failed';
        await payment.save();
        const e = new Error('Invalid payment signature');
        e.statusCode = 400;
        throw e;
    }

    payment.status = 'completed';
    payment.providerId = razorpayPaymentId;
    await payment.save();
    return payment;
};

export const getPaymentById = async (paymentId, userId) => {
    const payment = await Payment.findById(paymentId)
        .populate('payer', 'name email avatar')
        .populate('payee', 'name email avatar');
    if (!payment) {
        const e = new Error('Payment not found');
        e.statusCode = 404;
        throw e;
    }
    return payment;
};

export const listPayments = async (userId, query) => {
    const { page, limit, skip, sort } = getPagination(query);
    const userObjId = new mongoose.Types.ObjectId(userId);
    const statusFilter = query.status && query.status !== 'all' ? { status: query.status } : {};
    const filter = {
        $or: [{ payer: userObjId }, { payee: userObjId }],
        ...statusFilter,
    };

    const [payments, total] = await Promise.all([
        Payment.find(filter)
            .populate('payer', 'name email avatar')
            .populate('payee', 'name email avatar')
            .sort(sort)
            .skip(skip)
            .limit(limit),
        Payment.countDocuments(filter),
    ]);

    // Get stats using ObjectId for aggregation
    const stats = await Payment.aggregate([
        { $match: { $or: [{ payer: userObjId }, { payee: userObjId }] } },
        {
            $group: {
                _id: null,
                totalSent: {
                    $sum: { $cond: [{ $eq: ['$payer', userObjId] }, '$amount', 0] },
                },
                totalReceived: {
                    $sum: { $cond: [{ $eq: ['$payee', userObjId] }, '$amount', 0] },
                },
                completedCount: {
                    $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] },
                },
                pendingCount: {
                    $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
                },
            },
        },
    ]);

    return {
        payments,
        stats: stats[0] || { totalSent: 0, totalReceived: 0, completedCount: 0, pendingCount: 0 },
        pagination: buildPaginationMeta(total, page, limit),
    };
};
