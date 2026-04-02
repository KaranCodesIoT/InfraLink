import React from 'react';
import { Hammer, Star, MapPin } from 'lucide-react';

export default function WorkerCard({ worker, onClick }) {
    return (
        <div className="worker-card" onClick={() => onClick?.(worker)}>
            <div className="worker-avatar-box">
                {worker.avatar
                    ? <img src={worker.avatar} alt={worker.name} />
                    : <Hammer size={28} style={{ color: 'rgba(99,102,241,0.3)' }} />
                }
            </div>
            <div className="worker-name">{worker.name || 'Professional'}</div>
            <div className="worker-type">{worker.contractorType || worker.role || 'Expert'}</div>
            <div className="worker-meta">
                <span className="worker-rating">
                    <Star size={10} fill="#fbbf24" stroke="#fbbf24" style={{ marginRight: 3, verticalAlign: 'middle' }} />
                    {worker.rating || '4.5'}
                </span>
                <span className="worker-city">
                    <MapPin size={9} style={{ marginRight: 2, verticalAlign: 'middle' }} />
                    {worker.location?.city || 'India'}
                </span>
            </div>
        </div>
    );
}
