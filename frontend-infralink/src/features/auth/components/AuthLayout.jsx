import React from 'react';
import '../auth.css';

export const AuthLayout = ({ title, subtitle, children }) => {
    return (
        <div className="auth-root auth-bg min-vh-100 d-flex flex-column justify-content-center align-items-center p-4">
            <div className="w-100 z-10 position-relative auth-shell" style={{ maxWidth: '450px' }}>
                <div className="text-center mb-4 auth-brand">
                    <div className="mx-auto bg-warning rounded d-flex align-items-center justify-content-center auth-brand__mark mb-3 shadow" style={{ width: '48px', height: '48px' }}>
                        <span className="text-dark fw-bold fs-5">IL</span>
                    </div>
                    <h1 className="fs-3 fw-bold text-dark auth-brand__name">InfraLink</h1>
                </div>

                <div className="auth-card auth-card__header border-top border-warning border-4 bg-white shadow-sm rounded-3 p-4 p-md-5 position-relative overflow-hidden">
                    <div className="mb-4 text-center">
                        <h2 className="fs-5 fw-semibold text-dark auth-card__title">{title}</h2>
                        {subtitle && <p className="text-muted mt-2 small auth-card__subtitle">{subtitle}</p>}
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
};
