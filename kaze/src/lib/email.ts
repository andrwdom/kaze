import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export async function sendWelcomeEmail(to: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Welcome to KAZE!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333;">Welcome to KAZE!</h1>
        <p>Thank you for subscribing to our newsletter. We're excited to have you join our community!</p>
        <p>Stay tuned for updates about our upcoming collection and exclusive offers.</p>
        <p>Best regards,<br>The KAZE Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully to:', to);
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw error;
  }
} 