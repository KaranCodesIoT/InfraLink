import React from 'react';
import { Loader2 } from 'lucide-react';

export const AuthButton = ({ children, isLoading, disabled, className = '', ...rest }) => {
    const isDisabled = isLoading || disabled;

    return (
        <button
            disabled={isDisabled}
            className={`auth-btn btn btn-warning w-100 fw-semibold py-2 d-flex align-items-center justify-content-center shadow-sm ${isLoading ? 'auth-btn--loading' : ''} ${className}`}
            {...rest}
        >
            {isLoading ? (
                <>
                    <Loader2 className="spinner-border spinner-border-sm auth-btn__spinner me-2" size={18} />
                    Please wait…
                </>
            ) : (
                children
            )}
        </button>
    );
};
