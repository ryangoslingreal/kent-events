const nodemailer = require('nodemailer');

function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
        },
    });
}

/**
 * Sends an email with a verification link.
 * 
 * @param {*} to 
 * @param {*} token 
 */
async function sendVerificationEmail(to, token) {
    const transporter = createTransporter();

    const verifyUrl = `${process.env.CORS_ORIGIN}/api/auth/verify?token=${token}`;

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