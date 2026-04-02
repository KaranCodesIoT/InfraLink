import * as paymentService from './payment.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

import fs from 'fs';
export const createOrder = async (req, res, next) => {
    try {
        const result = await paymentService.createOrder(req.user._id, req.body);
        sendCreated(res, result, 'Payment order created');
    } catch (e) { next(e); }
};

export const verifyPayment = async (req, res, next) => {
    try {
        const payment = await paymentService.verifyPayment(req.params.id, req.body);
        sendSuccess(res, payment, 'Payment verified successfully');
    } catch (e) { next(e); }
};

export const getPayment = async (req, res, next) => {
    try {
        const payment = await paymentService.getPaymentById(req.params.id, req.user._id);
        sendSuccess(res, payment);
    } catch (e) { next(e); }
};

export const listPayments = async (req, res, next) => {
    try {
        const { payments, stats, pagination } = await paymentService.listPayments(req.user._id, req.query);
        sendPaginatedSuccess(res, { payments, stats }, pagination);
    } catch (e) { next(e); }
};
