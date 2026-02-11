const nodemailer = require('nodemailer');

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.EMAIL_SMTP_HOST,
        port: Number(process.env.EMAIL_SMTP_PORT || 587),
        secure: false,
        auth: {
            user: process.env.EMAIL_SMTP_USER,
            pass: process.env.EMAIL_SMTP_PASS,
        },
    });
}

/**
 * Sends an email with a verification link.
 * 
 * * NOTE: This currently points directly to the backend verification endpoint.
 * * If/when a frontend verification page is implemented, this should instead target the frontend:
 * * `${process.env.CORS_ORIGIN}/api/auth/verify-email?token=${token}`
 * * and let the frontend call the backend API.
 * 
 * @param {*} to 
 * @param {*} token 
 */
async function sendVerificationEmail(to, token) {
    const transporter = createTransporter();

    const verifyUrl = `${process.env.VITE_API_TARGET}/api/auth/verify-email?token=${token}`;

    const from = process.env.EMAIL_FROM;
    const subject = "Verify your email address";
    const text = `Please verify your email address by clicking the following link: ${verifyUrl}\n\nIf you did not sign up, please ignore this email.`;

    const html = `
        <p>Please verify your email address by clicking the following link:</p>
        <p><a href="${verifyUrl}">Verify Email</a></p>
        <p>If you did not sign up, please ignore this email.</p>
    `;

    await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
    });
}

module.exports = {
    sendVerificationEmail
};