import { useState } from 'react';
import { Package, AlertTriangle, Truck, Check, Clock, Plus, X, Search } from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';

const STATUS_BADGE = {
  in_stock: { label: 'In Stock', badge: 'success' },
  low_stock: { label: 'Low Stock', badge: 'danger' },
  ordered: { label: 'Ordered', badge: 'info' },
  out_of_stock: { label: 'Out of Stock', badge: 'danger' },
};

const ORDER_STATUS = {
  confirmed: { label: 'Confirmed', badge: 'info' },
  shipped: { label: 'Shipped', badge: 'warning' },
  in_transit: { label: 'In Transit', badge: 'accent' },
  delivered: { label: 'Delivered', badge: 'success' },
};

export default function MaterialsPage() {
  const { materials, supplyOrders } = useProjectDashboardStore();
  const [searchVal, setSearchVal] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const lowStockItems = materials.filter(m => m.currentStock <= m.minThreshold);
  const totalValue = materials.reduce((s, m) => s + m.totalCost, 0);
  const categories = [...new Set(materials.map(m => m.category))];

  const filtered = materials.filter(m => {
    if (searchVal && !m.name.toLowerCase().includes(searchVal.toLowerCase())) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    return true;
  });

  // Category-wise cost
  const catCosts = categories.map(cat => {
    const cost = materials.filter(m => m.category === cat).reduce((s, m) => s + m.totalCost, 0);
    return { name: cat, cost, percent: ((cost / totalValue) * 100).toFixed(1) };
  }).sort((a, b) => b.cost - a.cost);

  return (
    <div className="dash-animate-in">
      <div className="dash-section-title">
        <Package className="dash-section-title-icon" />
        Materials & Supply Tracking
      </div>

      {/* KPI Row */}
      <div className="dash-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-accent)', '--kpi-bg': 'var(--dash-accent-subtle)' }}>
          <div className="dash-kpi-icon"><Package style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{materials.length}</div>
          <div className="dash-kpi-label">Total Materials</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-danger)', '--kpi-bg': 'var(--dash-danger-subtle)' }}>
          <div className="dash-kpi-icon"><AlertTriangle style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{lowStockItems.length}</div>
          <div className="dash-kpi-label">Low Stock Alerts</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-info)', '--kpi-bg': 'var(--dash-info-subtle)' }}>
          <div className="dash-kpi-icon"><Truck style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{supplyOrders.filter(o => o.status !== 'delivered').length}</div>
          <div className="dash-kpi-label">Active Orders</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-success)', '--kpi-bg': 'var(--dash-success-subtle)' }}>
          <div className="dash-kpi-icon"><Check style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">₹{(totalValue / 10000000).toFixed(1)}Cr</div>
          <div className="dash-kpi-label">Total Material Cost</div>
        </div>
      </div>

      <div className="dash-grid-2" style={{ marginBottom: 24 }}>
        {/* Cost by Category */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Cost by Category</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {catCosts.map(c => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                  <span style={{ color: 'var(--dash-text-secondary)' }}>{c.name}</span>
                  <span style={{ color: 'var(--dash-text-primary)', fontWeight: 600 }}>₹{(c.cost / 100000).toFixed(1)}L ({c.percent}%)</span>
                </div>
                <div className="dash-progress" style={{ height: 6 }}>
                  <div className="dash-progress-fill" style={{ width: `${c.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supply Orders */}
        <div className="dash-card">
          <div className="dash-card-header">
            <div className="dash-card-title">Supply Orders</div>
          </div>
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Material</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {supplyOrders.map(order => {
                  const st = ORDER_STATUS[order.status] || ORDER_STATUS.confirmed;
                  return (
                    <tr key={order.id}>
                      <td style={{ color: 'var(--dash-text-primary)', fontWeight: 500, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>{order.material}</td>
                      <td>{order.quantity}</td>
                      <td><span className={`dash-badge ${st.badge}`}>{st.label}</span></td>
                      <td>{order.expectedDelivery}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="dash-card">
        <div className="dash-card-header">
          <div className="dash-card-title">Inventory</div>
          <div className="dash-filters" style={{ marginBottom: 0 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--dash-text-muted)' }} />
              <input className="dash-search-input" placeholder="Search materials..." value={searchVal} onChange={e => setSearchVal(e.target.value)} style={{ width: 180 }} />
            </div>
            <button className={`dash-filter-btn ${filterStatus === 'all' ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>All</button>
            <button className={`dash-filter-btn ${filterStatus === 'low_stock' ? 'active' : ''}`} onClick={() => setFilterStatus('low_stock')}>Low Stock</button>
            <button className={`dash-filter-btn ${filterStatus === 'ordered' ? 'active' : ''}`} onClick={() => setFilterStatus('ordered')}>Ordered</button>
          </div>
        </div>
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Material</th>
                <th>Category</th>
                <th>Stock / Min</th>
                <th>Unit</th>
                <th>Supplier</th>
                <th>Status</th>
                <th>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(mat => {
                const st = STATUS_BADGE[mat.status] || STATUS_BADGE.in_stock;
                const isLow = mat.currentStock <= mat.minThreshold;
                return (
                  <tr key={mat.id} style={isLow ? { background: 'rgba(239,68,68,0.04)' } : {}}>
                    <td style={{ color: 'var(--dash-text-primary)', fontWeight: 500 }}>
                      {isLow && <AlertTriangle style={{ width: 12, height: 12, color: 'var(--dash-danger)', marginRight: 4, verticalAlign: '-2px' }} />}
                      {mat.name}
                    </td>
                    <td>{mat.category}</td>
                    <td>
                      <span style={{ color: isLow ? 'var(--dash-danger)' : 'var(--dash-text-primary)', fontWeight: 600 }}>{mat.currentStock}</span>
                      <span style={{ color: 'var(--dash-text-muted)' }}> / {mat.minThreshold}</span>
                    </td>
                    <td>{mat.unit}</td>
                    <td>{mat.supplier}</td>
                    <td><span className={`dash-badge ${st.badge}`}>{st.label}</span></td>
                    <td>₹{(mat.totalCost / 100000).toFixed(1)}L</td>
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
