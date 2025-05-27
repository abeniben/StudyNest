const { Resend } = require('resend');


if (!process.env.RESEND_API_KEY) {
    console.log("No resend key here")
  throw new Error('RESEND_API_KEY is not set in .env');
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Password reset email template
const getPasswordResetEmail = (name, resetUrl) => `
  <div style="background: #f9fafb; padding: 40px; font-family: Arial, sans-serif; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50;">Hi ${name},</h2>
      <p style="font-size: 16px; line-height: 1.6;">
        Forgot your StudyNest password? No worries! Click the button below to reset it:
      </p>
      <a
        href="${resetUrl}"
        style="
          display: inline-block;
          padding: 12px 24px;
          background-color: #4f46e5;
          color: #fff;
          text-decoration: none;
          border-radius: 6px;
          font-size: 16px;
          margin: 20px 0;
        "
      >
        Reset Password
      </a>
      <p style="font-size: 14px; color: #6b7280;">
        This link expires in 1 hour. If you didn’t request this, please ignore it.
      </p>
      <p style="font-size: 14px; color: #6b7280;">
        Happy studying!<br />
        The StudyNest Team
      </p>
    </div>
  </div>
`;

module.exports = { resend, getPasswordResetEmail };