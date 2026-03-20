import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './guards';
import {
    Login,
    Register,
    RoleSelect,
    ForgotPassword,
    ResetPassword,
    VerifyEmail
} from '@/features/auth';

export const AuthRoutes = () => {
    return (
        <Routes>
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-email" element={<VerifyEmail />} />
            <Route
                path="role-select"
                element={
                    <ProtectedRoute>
                        <RoleSelect />
                    </ProtectedRoute>
                }
            />
            {/* Catch-all route within /auth redirects to login */}
            <Route path="*" element={<Navigate to="/auth/login" replace />} />
        </Routes>
    );
};
