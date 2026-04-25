import { z } from 'zod';

export const sendOtpZodSchema = z.object({
    email: z.string({
        required_error: "Email is required",
    })
    .email("Please provide a valid email address"),
});

export const checkOtpZodSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please provide a valid email address'),
  otp: z.string({ required_error: 'OTP is required' }).length(6, 'OTP must be exactly 6 digits'),
});

export const loginZodSchema = z.object({
  email: z
    .string({
      required_error: 'Email is required',
      invalid_type_error: 'Email must be a string',
    })
    .email('Please provide a valid email address'),
  password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters'),
});
