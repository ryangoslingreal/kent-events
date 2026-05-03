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
 * Sends an email with a verification code.
 * 
 * @param {string} to - The recipient email address
 * @param {string} code - The 6-digit verification code
 */
async function sendVerificationEmail(to, code) {
    const transporter = createTransporter();

    const from = process.env.EMAIL_FROM;
    const subject = "Verify your email address";
    const text = `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you did not sign up, please ignore this email.`;

    const html = `
        <p>Your verification code is:</p>
        <p><strong style="font-size: 24px; letter-spacing: 4px;">${code}</strong></p>
        <p>This code expires in 10 minutes.</p>
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