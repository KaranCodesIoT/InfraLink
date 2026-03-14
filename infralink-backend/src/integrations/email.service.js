import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporter;

const getTransporter = () => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT, 10) || 587,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    return transporter;
};

export const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const info = await getTransporter().sendMail({
            from: process.env.EMAIL_FROM || 'InfraLink <noreply@infralink.com>',
            to,
            subject,
            html,
            text,
        });
        logger.info(`Email sent: ${info.messageId}`);
        return info;
    } catch (error) {
        logger.error(`Email send error: ${error.message}`);
        throw error;
    }
};
