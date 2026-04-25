import { getRedisClient, isRedisAvailable } from '../../config/redis.js';
import logger from '../../utils/logger.js';
import { Resend } from 'resend';

// Initialize with a dummy key if env var is missing to prevent server crash
const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key_to_prevent_crash');

// In-memory fallback when Redis is unavailable
const otpStore = new Map();

/**
 * Generate a 6-digit OTP, store it, and send via Resend.
 */
export const generateAndSendEmailOtp = async (email) => {
    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store in Redis (preferred) or in-memory fallback
    if (isRedisAvailable()) {
        const redis = getRedisClient();
        await redis.set(`otp_${email}`, otp, { EX: 120 }); // 2 min expiry
        logger.info(`OTP stored in Redis for ${email}`);
    } else {
        otpStore.set(email, { otp, expires: Date.now() + 120000 });
        logger.info(`OTP stored in memory for ${email}`);
    }

    try {
        await resend.emails.send({
            from: "onboarding@resend.dev",
            to: email,
            subject: "Your InfraLink OTP Code",
            html: `<h2>Your OTP is ${otp}</h2><p>This code will expire in 2 minutes.</p>`,
        });
        logger.info(`OTP email sent to ${email}`);
    } catch (err) {
        logger.error(`Failed to send OTP to ${email}`, err);
        throw new Error('Failed to send OTP email');
    }

    // Return OTP only for local DEV convenience logging, do not expose in production
    console.log(`\n=============================`);
    console.log(`  OTP for ${email}: ${otp}`);
    console.log(`=============================\n`);

    return otp; 
};

/**
 * Verify OTP: compare entered OTP with stored value.
 * Deletes OTP on successful match.
 */
export const verifyEmailOtp = async (email, otp) => {
    if (isRedisAvailable()) {
        const redis = getRedisClient();
        const storedOtp = await redis.get(`otp_${email}`);

        if (!storedOtp) return false;           // Expired or never sent
        if (storedOtp !== otp) return false;     // Wrong OTP

        await redis.del(`otp_${email}`);        // Delete after success
        return true;
    } else {
        const entry = otpStore.get(email);
        if (!entry) return false;
        if (Date.now() > entry.expires) {
            otpStore.delete(email);
            return false;                        // Expired
        }
        if (entry.otp !== otp) return false;     // Wrong OTP

        otpStore.delete(email);                  // Delete after success
        return true;
    }
};

/**
 * Mark email as verified temporarily (e.g. 10 minutes)
 */
export const markEmailAsVerified = async (email) => {
    if (isRedisAvailable()) {
        const redis = getRedisClient();
        await redis.set(`verified_email_${email}`, 'true', { EX: 600 }); // 10 minutes
    } else {
        otpStore.set(`verified_${email}`, { verified: true, expires: Date.now() + 600000 });
    }
};

/**
 * Check if email was verified recently
 * Deletes the flag upon successful check to prevent reuse
 */
export const isEmailVerified = async (email) => {
    if (isRedisAvailable()) {
        const redis = getRedisClient();
        const verified = await redis.get(`verified_email_${email}`);
        if (verified) {
            await redis.del(`verified_email_${email}`);
            return true;
        }
        return false;
    } else {
        const entry = otpStore.get(`verified_${email}`);
        if (entry && Date.now() <= entry.expires) {
            otpStore.delete(`verified_${email}`);
            return true;
        }
        return false;
    }
};
