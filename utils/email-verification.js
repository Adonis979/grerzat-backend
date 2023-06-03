const nodemailer = require("nodemailer");

function sendEmail(email, token) {
  const url = `http://localhost:3000/email-verify?token=${token}`;
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  transporter.sendMail({
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
}

exports.sendEmail = sendEmail;
