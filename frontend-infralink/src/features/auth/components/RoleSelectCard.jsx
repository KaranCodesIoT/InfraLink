import React from 'react';
import { Building2, HardHat, Package, ShieldCheck, CheckCircle2 } from 'lucide-react';

const ROLES = [
    { id: 'client', label: 'Client', sub: 'Post jobs & hire workers', color: '#F59E0B', icon: Building2 },
    { id: 'worker', label: 'Worker', sub: 'Find jobs & get hired', color: '#3B82F6', icon: HardHat },
    { id: 'vendor', label: 'Vendor', sub: 'Sell materials & supplies', color: '#10B981', icon: Package },
    { id: 'admin', label: 'Admin', sub: 'Platform management', color: '#8B5CF6', icon: ShieldCheck }
];

export const RoleSelectCard = ({ value, onChange }) => {
    return (
        <div className="role-grid row g-3 mb-4">
            {ROLES.map((role) => {
                const Icon = role.icon;
                const isActive = value === role.id;

                return (
                    <div className="col-6" key={role.id}>
                        <button
                            type="button"
                            onClick={() => onChange(role.id)}
                            className={`role-card w-100 position-relative p-3 rounded border text-start transition-all overflow-hidden ${isActive
                                ? 'role-card--active border-warning bg-dark shadow-sm'
                                : 'border-secondary bg-transparent'
                                }`}
                            style={{ '--role-color': role.color }}
                        >
                            {isActive && (
                                <div className="role-card__check position-absolute top-0 end-0 mt-2 me-2 text-warning">
                                    <CheckCircle2 size={20} className="text-dark bg-warning rounded-circle" />
                                </div>
                            )}

                            <div
                                className="role-card__icon-wrap mb-3 rounded d-flex align-items-center justify-content-center"
                                style={{ width: '40px', height: '40px', backgroundColor: isActive ? role.color : '#212529', color: isActive ? '#fff' : role.color }}
                            >
                                <Icon size={22} />
                            </div>

                            <div className="role-card__label fw-semibold text-white mb-1">{role.label}</div>
                            <div className="role-card__sub small text-secondary">{role.sub}</div>

                            {isActive && (
                                <div
                                    className="position-absolute w-100 h-100 top-0 start-0 opacity-25 pe-none"
                                    style={{ background: `radial-gradient(circle at center, ${role.color} 0%, transparent 70%)` }}
                                />
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
};
