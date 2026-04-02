import { useState } from 'react';
import { X, Loader2, IndianRupee, Mail, FileText, AlertTriangle } from 'lucide-react';
import { paymentApi } from '../services/payment.service.js';
import { ENV } from '../../../config/env.js';

export default function PaymentForm({ onClose, onSuccess }) {
  const [payeeEmail, setPayeeEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Create order on backend
      const { data } = await paymentApi.createOrder({
        payeeEmail,
        amount: Number(amount),
        description,
      });

      const { payment, order, keyId, demo } = data.data;

      // Step 2: If demo mode (no Razorpay keys), auto-complete
      if (demo) {
        await paymentApi.verifyPayment(payment._id, {
          orderId: order.id,
          razorpayPaymentId: `demo_pay_${Date.now()}`,
          signature: 'demo_signature',
        });
        onSuccess?.();
        onClose();
        return;
      }

      // Step 3: Open Razorpay Checkout
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'InfraLink',
        description: description || 'Payment for services',
        order_id: order.id,
        handler: async (response) => {
          try {
            await paymentApi.verifyPayment(payment._id, {
              orderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            onSuccess?.();
            onClose();
          } catch (err) {
            setError('Payment verification failed');
            setLoading(false);
          }
        },
        prefill: {},
        theme: { color: '#ea580c' },
        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      if (window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        setError('Razorpay SDK not loaded. Please refresh and try again.');
        setLoading(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create payment order');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <IndianRupee className="w-5 h-5" />
            Send Payment
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <Mail className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
              Payee Email
            </label>
            <input
              type="email"
              required
              value={payeeEmail}
              onChange={(e) => setPayeeEmail(e.target.value)}
              placeholder="e.g. contractor@gmail.com"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <IndianRupee className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
              Amount (₹)
            </label>
            <input
              type="number"
              required
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              <FileText className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Payment for plumbing work"
              rows="2"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition resize-none"
            />
          </div>

          {/* Amount Preview */}
          {amount && Number(amount) > 0 && (
            <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-3 flex justify-between items-center">
              <span className="text-sm text-gray-600">Total payable</span>
              <span className="text-xl font-bold text-orange-600">₹{Number(amount).toLocaleString('en-IN')}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !payeeEmail || !amount}
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 rounded-xl font-bold text-sm hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-200"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <IndianRupee className="w-4 h-4" />
                Pay ₹{amount ? Number(amount).toLocaleString('en-IN') : '0'}
              </>
            )}
          </button>

          <p className="text-[11px] text-gray-400 text-center">
            Payments are secured by Razorpay. UPI, Cards, Net Banking supported.
          </p>
        </form>
      </div>
    </div>
  );
}
