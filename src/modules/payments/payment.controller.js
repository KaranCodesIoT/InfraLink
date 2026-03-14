import * as paymentService from './payment.service.js';
import { sendSuccess, sendCreated, sendPaginatedSuccess } from '../../utils/response.utils.js';

export const createOrder = async (req, res, next) => {
    try { sendCreated(res, await paymentService.createOrder(req.user._id, req.body), 'Order created'); }
    catch (e) { next(e); }
};

export const verifyPayment = async (req, res, next) => {
    try { sendSuccess(res, await paymentService.verifyPayment(req.params.id, req.body), 'Payment verified'); }
    catch (e) { next(e); }
};

export const listPayments = async (req, res, next) => {
    try {
        const { payments, pagination } = await paymentService.listPayments(req.user._id, req.query);
        sendPaginatedSuccess(res, payments, pagination);
    } catch (e) { next(e); }
};
