const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, body }) => {
  const msg = {
    to,
    from: process.env.FROM_EMAIL,
    subject,
    text: body
  };

  await sgMail.send(msg);
};

module.exports = { sendEmail };

