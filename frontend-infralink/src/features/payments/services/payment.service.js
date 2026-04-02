import api from '../../../lib/axios.js';

export const paymentApi = {
  createOrder: (data) => api.post('/payments/order', data),
  verifyPayment: (paymentId, data) => api.post(`/payments/${paymentId}/verify`, data),
  listPayments: (params) => api.get('/payments', { params }),
  getPayment: (id) => api.get(`/payments/${id}`),
};
