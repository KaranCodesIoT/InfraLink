import React from 'react';
import { Package } from 'lucide-react';

export default function MaterialCard({ material }) {
    const priceStr = material.price
        ? `₹${Number(material.price).toLocaleString('en-IN')}`
        : 'Price N/A';

    return (
        <div className="material-card">
            <div className="material-icon">
                <Package size={20} />
            </div>
            <div className="material-name">{material.name || 'Material'}</div>
            <div className="material-price">
                {priceStr}
                {material.unit && <span className="material-unit"> / {material.unit}</span>}
            </div>
            {material.category && (
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                    {material.category}
                </div>
            )}
            <span className={`material-badge ${material.isAvailable !== false ? 'available' : 'unavailable'}`}>
                {material.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
            </span>
        </div>
    );
}
