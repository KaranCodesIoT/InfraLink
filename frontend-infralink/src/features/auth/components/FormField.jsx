import React, { forwardRef, useState } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export const FormField = forwardRef(({
    label,
    name,
    type = 'text',
    placeholder,
    value,
    onChange,
    error,
    autoComplete,
    className = ''
}, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`form-field mb-3 ${className}`}>
            {label && (
                <label htmlFor={name} className="form-field__label form-label text-dark mb-1 fw-medium small">
                    {label}
                </label>
            )}
            <div className="form-field__input-wrap position-relative d-flex align-items-center">
                <input
                    ref={ref}
                    id={name}
                    name={name}
                    type={inputType}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                    className={`form-field__input w-100 form-control bg-white border-secondary-subtle text-dark ${error ? 'form-field__input--error is-invalid' : ''} ${isPassword ? 'pe-5' : ''}`}
                    style={{ height: '48px' }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="form-field__eye position-absolute end-0 me-3 text-secondary btn btn-link p-0 text-decoration-none shadow-none"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
            {error && (
                <div className="form-field__error mt-1 d-flex align-items-start text-danger small">
                    <AlertCircle size={14} className="me-1 mt-1 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
});

FormField.displayName = 'FormField';
