<<<<<<< Updated upstream
import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../../store/auth.store.js';
import { paymentApi } from '../services/payment.service.js';
import PaymentForm from '../components/PaymentForm.jsx';
import {
  Loader2, ArrowLeft, IndianRupee, TrendingUp, TrendingDown, CreditCard, Clock,
  CheckCircle2, XCircle, AlertCircle, PlusCircle, ArrowUpRight, ArrowDownLeft, Filter,
} from 'lucide-react';

const STATUS_COLORS = {
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-gray-50 text-gray-600 border-gray-200',
};

const STATUS_ICONS = {
  completed: CheckCircle2,
  pending: Clock,
  processing: Loader2,
  failed: XCircle,
  refunded: AlertCircle,
};

export default function Payments() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({ totalSent: 0, totalReceived: 0, completedCount: 0, pendingCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const loadPayments = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data } = await paymentApi.listPayments({ page, limit: 10, status: statusFilter, sort: '-createdAt' });
      setPayments(data.data?.payments || []);
      setStats(data.data?.stats || stats);
      setPagination(data.pagination || null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  }, [user, page, statusFilter]);

  useEffect(() => { loadPayments(); }, [loadPayments]);

  const handlePaymentSuccess = () => {
    loadPayments();
  };

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTime = (d) => {
    const date = new Date(d);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-full text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 mb-6 transition-all w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-6 h-6 text-orange-600" />
            <h1 className="text-3xl font-extrabold text-gray-900">Payments</h1>
          </div>
          <p className="text-gray-500">Manage your transactions and payment history.</p>
        </div>
        <button
          onClick={() => setShowPaymentForm(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-orange-200 hover:from-orange-600 hover:to-orange-700 transition whitespace-nowrap"
        >
          <PlusCircle className="w-5 h-5" />
          Send Payment
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-500" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Sent</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 flex items-center">
            <IndianRupee className="w-5 h-5 mr-0.5 text-gray-500" />
            {stats.totalSent?.toLocaleString('en-IN') || '0'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-emerald-500" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Received</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900 flex items-center">
            <IndianRupee className="w-5 h-5 mr-0.5 text-gray-500" />
            {stats.totalReceived?.toLocaleString('en-IN') || '0'}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Completed</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats.completedCount || 0}</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pending</span>
          </div>
          <p className="text-2xl font-extrabold text-gray-900">{stats.pendingCount || 0}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 mb-6 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
        <Filter className="w-4 h-4 text-gray-400" />
        {['all', 'completed', 'pending', 'failed'].map((s) => (
          <button
            key={s}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
              statusFilter === s
                ? 'bg-orange-500 text-white shadow-sm'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* Transactions Table */}
      {loading && payments.length === 0 ? (
        <div className="flex justify-center items-center py-24">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-16 text-center">
          <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-700 mb-2">No transactions yet</h3>
          <p className="text-gray-400 text-sm">Start by sending your first payment to a professional.</p>
          <button
            onClick={() => setShowPaymentForm(true)}
            className="inline-flex items-center gap-2 mt-6 bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-orange-700 transition text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Send Payment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-1">Type</div>
            <div className="col-span-3">Details</div>
            <div className="col-span-2">To / From</div>
            <div className="col-span-2 text-right">Amount</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
          </div>

          {/* Table Rows */}
          {payments.map((p) => {
            const isSent = p.payer?._id === user?._id;
            const counterpart = isSent ? p.payee : p.payer;
            const StatusIcon = STATUS_ICONS[p.status] || Clock;

            return (
              <div
                key={p._id}
                className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50/50 transition items-center"
              >
                {/* Type Icon */}
                <div className="col-span-1">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSent ? 'bg-red-50' : 'bg-emerald-50'}`}>
                    {isSent ? (
                      <ArrowUpRight className="w-4 h-4 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="col-span-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {p.description || (isSent ? 'Payment sent' : 'Payment received')}
                  </p>
                  <p className="text-xs text-gray-400 truncate">ID: {p._id?.slice(-8)}</p>
                </div>

                {/* Counterpart */}
                <div className="col-span-2 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{counterpart?.name || 'N/A'}</p>
                  <p className="text-xs text-gray-400 truncate">{counterpart?.email || ''}</p>
                </div>

                {/* Amount */}
                <div className="col-span-2 text-right">
                  <p className={`text-sm font-bold ${isSent ? 'text-red-600' : 'text-emerald-600'}`}>
                    {isSent ? '-' : '+'}₹{p.amount?.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Date */}
                <div className="col-span-2">
                  <p className="text-sm text-gray-700">{formatDate(p.createdAt)}</p>
                  <p className="text-xs text-gray-400">{formatTime(p.createdAt)}</p>
                </div>

                {/* Status */}
                <div className="col-span-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${STATUS_COLORS[p.status] || STATUS_COLORS.pending}`}>
                    <StatusIcon className={`w-3 h-3 ${p.status === 'processing' ? 'animate-spin' : ''}`} />
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination?.pages > 1 && (
        <div className="mt-8 flex justify-center items-center gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
          >
            ← Previous
          </button>
          <span className="px-4 py-2 text-sm text-gray-600">
            Page {page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-40 hover:bg-gray-50"
          >
            Next →
          </button>
        </div>
      )}

      {/* Payment Form Modal */}
      {showPaymentForm && (
        <PaymentForm onClose={() => setShowPaymentForm(false)} onSuccess={handlePaymentSuccess} />
      )}
=======
import { useState } from 'react';
import { CreditCard, Smartphone, Plus, CheckCircle2, ShieldCheck, MoreVertical } from 'lucide-react';

export default function Payments() {
  const [activeTab, setActiveTab] = useState('payment-methods');

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payments & Billing</h1>
        <p className="text-gray-500 mt-2">Manage your connected payment methods and transaction history.</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl w-fit mb-8">
        <button
          onClick={() => setActiveTab('payment-methods')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'payment-methods' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Payment Methods
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            activeTab === 'transactions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Transaction History
        </button>
      </div>

      {activeTab === 'payment-methods' && (
        <div className="space-y-8">
          {/* UPI Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-600" />
                UPI Apps & IDs
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Linked UPI Example */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-bold text-sm">GPay</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">user@okaxis</p>
                      <p className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Default Method
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Add New UPI Button */}
              <button className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 transition-all group min-h-[120px]">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-indigo-600" />
                </div>
                <span className="text-sm font-semibold">Link New UPI ID</span>
              </button>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* Cards Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-600" />
                Credit & Debit Cards
              </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Linked Card Example */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-5 rounded-2xl shadow-lg relative text-white overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10" />
                <div className="flex justify-between items-start mb-8">
                  <ShieldCheck className="w-6 h-6 text-gray-300 opacity-80" />
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded">Visa</span>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-widest">Card Number</p>
                  <p className="font-mono text-lg tracking-wider">•••• •••• •••• 4242</p>
                </div>
                <div className="flex justify-between items-center mt-6">
                  <div>
                    <p className="text-xs text-gray-400 uppercase">Valid Thru</p>
                    <p className="text-sm font-medium font-mono border-b border-dashed border-gray-600">12 / 28</p>
                  </div>
                </div>
              </div>

              {/* Add New Card Button */}
              <button className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-5 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-700 transition-all group min-h-[180px]">
                <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                  <Plus className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm font-semibold">Add New Card</span>
              </button>
            </div>
          </section>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
           <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <CreditCard className="w-8 h-8 text-gray-300" />
           </div>
           <h3 className="text-lg font-bold text-gray-900 mb-1">No Transactions Yet</h3>
           <p className="text-gray-500 text-sm">When you make or receive payments, your history will appear here.</p>
        </div>
      )}
>>>>>>> Stashed changes
    </div>
  );
}
