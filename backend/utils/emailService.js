const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Using Ethereal mock email for development
  // In production, use SendGrid, Mailgun, or standard SMTP
  let transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'lola.simonis@ethereal.email', // Replace with valid test account if needed
        pass: 'T3m1yC21pE3rM3hPzJ'
    }
  });

  const mailOptions = {
    from: '"Verified Roommate Matcher" <noreply@roommatematcher.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  const info = await transporter.sendMail(mailOptions);

  console.log('Message sent: %s', info.messageId);
  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
};

module.exports = sendEmail;
