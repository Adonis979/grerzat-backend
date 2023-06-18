const nodemailer = require("nodemailer");

async function EmailVerification(email, token) {
  const url = `https://grerezat.vercel.app/email-verify?token=${token}`;
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    await transporter.sendMail({
      to: email,
      subject: "Verify Account",
      html: `
        <div>
            <h1>Welcome to Grerëzat!</h1>
            <p>Thank you for signing up as a business account. Please verify your email address to get started.</p>
            <p>Click <a href='${url}'>here</a> to confirm your email.</p>
            <p>If you didn't sign up for an account on our platform, you can ignore this email.</p>
            <p>Have a great day!</p>
        </div>
  `,
    });
  } catch (error) {
    console.log(error);
  }
}

function ForgotPasswordEmail(email, user, code) {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  transporter.sendMail({
    to: email,
    subject: "Reset Password Code",
    html: `
        <div>
            <h1>Hello ${user.username}!</h1>
            <p>This is your password reset code</p>
            <p><b>${code}</b></p>
            <p>Code is valid for 1 hour</p>
        </div>
  `,
  });
}
exports.EmailVerification = EmailVerification;
exports.ForgotPasswordEmail = ForgotPasswordEmail;
