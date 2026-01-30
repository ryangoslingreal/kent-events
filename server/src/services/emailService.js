const nodemailer = require('nodemailer');

// ! Awaiting email to be set up...

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SMTP_HOST,
    port: Number(process.env.EMAIL_SMTP_PORT || 587),
    secure: false,
    auth: {
        user: process.env.EMAIL_SMTP_USER,
        pass: process.env.EMAIL_SMTP_PASS,
    },
});

async function sendVerificationEmail(to, token) {
    const verifyUrl = `${process.env.CORS_ORIGIN}/verify-email?token=${token}`;

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