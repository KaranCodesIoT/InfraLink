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

export const googleAuthZodSchema = z.object({
  token: z.string({ required_error: 'Google token is required' }),
});

export const updateRoleZodSchema = z.object({
  role: z.string({ required_error: 'Role is required' }),
  contractorType: z.string().optional(),
});

export const registerZodSchema = z.object({
  name: z.string({ required_error: 'Name is required' }),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email'),
  password: z.string({ required_error: 'Password is required' }).min(8),
  phone: z.string().optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
  }).optional(),
});
