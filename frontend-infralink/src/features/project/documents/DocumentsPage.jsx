import { useState } from 'react';
import { FileText, Search, Filter, Download, Eye, File, Image, Archive, Plus, X, Upload } from 'lucide-react';
import useProjectDashboardStore from '../../../store/projectDashboard.store.js';

const FILE_ICONS = {
  pdf: { icon: FileText, color: '#ef4444' },
  xlsx: { icon: File, color: '#22c55e' },
  docx: { icon: File, color: '#3b82f6' },
  zip: { icon: Archive, color: '#eab308' },
  jpg: { icon: Image, color: '#8b5cf6' },
  png: { icon: Image, color: '#8b5cf6' },
};

const STATUS_BADGE = {
  approved: { label: 'Approved', badge: 'success' },
  review: { label: 'In Review', badge: 'warning' },
  draft: { label: 'Draft', badge: 'neutral' },
  rejected: { label: 'Rejected', badge: 'danger' },
};

export default function DocumentsPage() {
  const { documents, addDocument } = useProjectDashboardStore();
  const [searchVal, setSearchVal] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDoc, setNewDoc] = useState({ name: '', category: 'Engineering', type: 'pdf', size: '1 MB', uploadedBy: '' });

  const categories = ['all', ...new Set(documents.map(d => d.category))];

  const filtered = documents.filter(d => {
    if (searchVal && !d.name.toLowerCase().includes(searchVal.toLowerCase())) return false;
    if (filterCategory !== 'all' && d.category !== filterCategory) return false;
    return true;
  });

  const handleAdd = () => {
    if (!newDoc.name.trim()) return;
    addDocument(newDoc);
    setNewDoc({ name: '', category: 'Engineering', type: 'pdf', size: '1 MB', uploadedBy: '' });
    setShowAddModal(false);
  };

  return (
    <div className="dash-animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="dash-section-title" style={{ marginBottom: 0 }}>
          <FileText className="dash-section-title-icon" />
          Documents
        </div>
        <button className="dash-btn dash-btn-primary" onClick={() => setShowAddModal(true)}>
          <Upload style={{ width: 16, height: 16 }} /> Upload Document
        </button>
      </div>

      {/* Stats */}
      <div className="dash-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', marginBottom: 20 }}>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-accent)', '--kpi-bg': 'var(--dash-accent-subtle)' }}>
          <div className="dash-kpi-icon"><FileText style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{documents.length}</div>
          <div className="dash-kpi-label">Total Documents</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-success)', '--kpi-bg': 'var(--dash-success-subtle)' }}>
          <div className="dash-kpi-icon"><Eye style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{documents.filter(d => d.status === 'approved').length}</div>
          <div className="dash-kpi-label">Approved</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-warning)', '--kpi-bg': 'var(--dash-warning-subtle)' }}>
          <div className="dash-kpi-icon"><File style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{documents.filter(d => d.status === 'review').length}</div>
          <div className="dash-kpi-label">In Review</div>
        </div>
        <div className="dash-kpi" style={{ '--kpi-color': 'var(--dash-info)', '--kpi-bg': 'var(--dash-info-subtle)' }}>
          <div className="dash-kpi-icon"><Archive style={{ width: 20, height: 20 }} /></div>
          <div className="dash-kpi-value">{[...new Set(documents.map(d => d.category))].length}</div>
          <div className="dash-kpi-label">Categories</div>
        </div>
      </div>

      {/* Filters */}
      <div className="dash-filters">
        <div style={{ position: 'relative' }}>
          <Search style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, color: 'var(--dash-text-muted)' }} />
          <input className="dash-search-input" placeholder="Search documents..." value={searchVal} onChange={e => setSearchVal(e.target.value)} />
        </div>
        <Filter style={{ width: 14, height: 14, color: 'var(--dash-text-muted)' }} />
        {categories.map(cat => (
          <button key={cat} className={`dash-filter-btn ${filterCategory === cat ? 'active' : ''}`} onClick={() => setFilterCategory(cat)}>
            {cat === 'all' ? 'All Categories' : cat}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      <div className="dash-card">
        <div className="dash-table-wrap">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Document</th>
                <th>Category</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => {
                const fileType = FILE_ICONS[doc.type] || FILE_ICONS.pdf;
                const FileIcon = fileType.icon;
                const st = STATUS_BADGE[doc.status] || STATUS_BADGE.draft;

                return (
                  <tr key={doc.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 'var(--dash-radius-sm)',
                        background: `${fileType.color}20`, color: fileType.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                      }}>
                        <FileIcon style={{ width: 16, height: 16 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--dash-text-primary)' }}>{doc.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--dash-text-muted)' }}>.{doc.type}</div>
                      </div>
                    </td>
                    <td><span className="dash-badge neutral">{doc.category}</span></td>
                    <td>{doc.size}</td>
                    <td>{doc.uploadedBy}</td>
                    <td>{doc.uploadedAt}</td>
                    <td><span className={`dash-badge ${st.badge}`}>{st.label}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="dash-btn dash-btn-sm" title="View">
                          <Eye style={{ width: 13, height: 13 }} />
                        </button>
                        <button className="dash-btn dash-btn-sm" title="Download">
                          <Download style={{ width: 13, height: 13 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <div className="dash-empty">
            <FileText className="dash-empty-icon" />
            <div className="dash-empty-title">No documents found</div>
            <div className="dash-empty-desc">Upload your first document</div>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showAddModal && (
        <div className="dash-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="dash-modal" onClick={e => e.stopPropagation()}>
            <div className="dash-modal-header">
              <span className="dash-modal-title">Upload Document</span>
              <button className="dash-modal-close" onClick={() => setShowAddModal(false)}>
                <X style={{ width: 18, height: 18 }} />
              </button>
            </div>
            <div className="dash-modal-body">
              <div className="dash-input-group">
                <label className="dash-label">Document Name *</label>
                <input className="dash-input" placeholder="e.g. Floor Plan - 9th Floor" value={newDoc.name} onChange={e => setNewDoc({ ...newDoc, name: e.target.value })} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="dash-input-group">
                  <label className="dash-label">Category</label>
                  <select className="dash-select" value={newDoc.category} onChange={e => setNewDoc({ ...newDoc, category: e.target.value })}>
                    <option value="Blueprints">Blueprints</option>
                    <option value="Legal">Legal</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Reports">Reports</option>
                    <option value="Safety">Safety</option>
                    <option value="Contracts">Contracts</option>
                    <option value="Media">Media</option>
                  </select>
                </div>
                <div className="dash-input-group">
                  <label className="dash-label">File Type</label>
                  <select className="dash-select" value={newDoc.type} onChange={e => setNewDoc({ ...newDoc, type: e.target.value })}>
                    <option value="pdf">PDF</option>
                    <option value="xlsx">Excel</option>
                    <option value="docx">Word</option>
                    <option value="zip">ZIP Archive</option>
                    <option value="jpg">Image</option>
                  </select>
                </div>
              </div>
              <div className="dash-input-group">
                <label className="dash-label">Uploaded By</label>
                <input className="dash-input" placeholder="Your name" value={newDoc.uploadedBy} onChange={e => setNewDoc({ ...newDoc, uploadedBy: e.target.value })} />
              </div>
            </div>
            <div className="dash-modal-footer">
              <button className="dash-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
              <button className="dash-btn dash-btn-primary" onClick={handleAdd}>
                <Upload style={{ width: 14, height: 14 }} /> Upload
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
