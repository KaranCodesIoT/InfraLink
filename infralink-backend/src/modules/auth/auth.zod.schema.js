import { z } from 'zod';

export const sendOtpZodSchema = z.object({
    email: z.string({
        required_error: "Email is required",
    })
    .email("Please provide a valid email address"),
});

export const verifyOtpZodSchema = z.object({
    email: z.string({
        required_error: "Email is required",
    })
    .email("Please provide a valid email address"),
    otp: z.string({
        required_error: "OTP is required",
    })
    .length(6, "OTP must be exactly 6 digits"),
});
