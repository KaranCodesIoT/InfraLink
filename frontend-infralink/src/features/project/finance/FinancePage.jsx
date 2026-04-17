import { Wallet, TrendingUp, TrendingDown, IndianRupee, AlertTriangle, Check, Clock, Calendar } from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';

const PAYMENT_STATUS = {
  completed: { label: 'Completed', badge: 'success' },
  pending: { label: 'Pending', badge: 'warning' },
  scheduled: { label: 'Scheduled', badge: 'info' },
  failed: { label: 'Failed', badge: 'danger' },
};

function formatCurrency(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
  return `₹${val.toLocaleString('en-IN')}`;
}

export default function FinancePage() {
  const { finance, payments } = useProjectDashboardStore();
  if (!finance) return null;

  const overrunPercent = ((finance.projected - finance.totalBudget) / finance.totalBudget * 100).toFixed(1);
  const spentPercent = ((finance.spent / finance.totalBudget) * 100).toFixed(1);

  return (
    <div className="dash-animate-in">
      <div className="dash-section-title">
        <Wallet className="dash-section-title-icon" />
        Finance & Payments
      </div>

      {/* Budget Overview */}
      <div className="dash-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-accent)', '--kpi-bg': 'var(--dash-accent-subtle)' }}>
          <div className="dash-kpi-icon"><IndianRupee style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{formatCurrency(finance.totalBudget)}</div>
          <div className="dash-kpi-label">Total Budget</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-warning)', '--kpi-bg': 'var(--dash-warning-subtle)' }}>
          <div className="dash-kpi-icon"><TrendingUp style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{formatCurrency(finance.spent)}</div>
          <div className="dash-kpi-label">Total Spent ({spentPercent}%)</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-success)', '--kpi-bg': 'var(--dash-success-subtle)' }}>
          <div className="dash-kpi-icon"><Check style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{formatCurrency(finance.remaining)}</div>
          <div className="dash-kpi-label">Remaining Budget</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': finance.projected > finance.totalBudget ? 'var(--dash-danger)' : 'var(--dash-success)', '--kpi-bg': finance.projected > finance.totalBudget ? 'var(--dash-danger-subtle)' : 'var(--dash-success-subtle)' }}>
          <div className="dash-kpi-icon"><TrendingDown style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{formatCurrency(finance.projected)}</div>
          <div className="dash-kpi-label">Projected Total {overrunPercent > 0 ? `(+${overrunPercent}%)` : ''}</div>
          {finance.projected > finance.totalBudget && (
            <div className="dash-kpi-change down">
              <AlertTriangle style={{ width: 10, height: 10 }} /> Over Budget
            </div>
          )}
        </div>
      </div>

      <div className="dash-grid-2" style={{ marginBottom: 24 }}>
        {/* Expense Categories */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Expense Breakdown</div>
          </div>

          {/* Visual donut via stacked bars */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', height: 12, borderRadius: 999, overflow: 'hidden', background: 'rgba(255,255,255,0.04)' }}>
              {finance.categories.map(cat => (
                <div key={cat.name} style={{ width: `${cat.percent}%`, background: cat.color, transition: 'width 0.6s ease' }} title={`${cat.name}: ${cat.percent}%`} />
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {finance.categories.map(cat => (
              <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color, flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: 'var(--dash-text-secondary)' }}>{cat.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dash-text-primary)', minWidth: 80, textAlign: 'right' }}>{formatCurrency(cat.amount)}</span>
                <span style={{ fontSize: 11, color: 'var(--dash-text-muted)', minWidth: 40, textAlign: 'right' }}>{cat.percent}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Progress */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Budget Utilization</div>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--dash-text-primary)', letterSpacing: -2, lineHeight: 1 }}>
              {spentPercent}%
            </div>
            <div style={{ fontSize: 12, color: 'var(--dash-text-muted)', marginTop: 4 }}>of total budget utilized</div>
          </div>

          <div className="dash-progress" style={{ height: 12, borderRadius: 999, marginBottom: 8 }}>
            <div className="dash-progress-fill" style={{
              width: `${spentPercent}%`,
              background: parseFloat(spentPercent) > 80 ? 'var(--dash-danger)' : parseFloat(spentPercent) > 50 ? 'var(--dash-warning)' : 'var(--dash-success)',
              borderRadius: 999
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--dash-text-muted)' }}>
            <span>₹0</span>
            <span>{formatCurrency(finance.totalBudget)}</span>
          </div>

          {finance.projected > finance.totalBudget && (
            <div style={{
              marginTop: 16, padding: 12, background: 'var(--dash-danger-subtle)',
              borderRadius: 'var(--dash-radius-sm)', border: '1px solid rgba(239,68,68,0.2)',
              display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--dash-danger)'
            }}>
              <AlertTriangle style={{ width: 14, height: 14, flexShrink: 0 }} />
              Projected cost exceeds budget by {formatCurrency(finance.projected - finance.totalBudget)}
            </div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="dash-card">
        <div className="dash-card-header">
          <div className="dash-card-title">Payment History</div>
        </div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Recipient</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Invoice</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const st = PAYMENT_STATUS[p.status] || PAYMENT_STATUS.completed;
                return (
                  <tr key={p.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Calendar style={{ width: 12, height: 12, color: 'var(--dash-text-muted)' }} />
                      {p.date}
                    </td>
                    <td style={{ color: 'var(--dash-text-primary)', fontWeight: 500 }}>{p.recipient}</td>
                    <td>{p.category}</td>
                    <td style={{ fontWeight: 600, color: 'var(--dash-text-primary)' }}>{formatCurrency(p.amount)}</td>
                    <td>{p.method}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{p.invoice}</td>
                    <td><span className={`dash-badge ${st.badge}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
