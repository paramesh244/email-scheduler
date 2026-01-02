const cron = require("node-cron");
const Email = require("../models/Email");
const { sendEmail } = require("../services/emailService");

const startScheduler = () => {
  cron.schedule("* * * * *", async () => {
    console.log("Checking scheduled emails...");

    const emails = await Email.find({
      scheduledAt: { $lte: new Date() },
      status: "PENDING"
    });

    for (const email of emails) {
      try {
        console.log(`Sending email to ${email.to}...`);
        await sendEmail(email);
        email.status = "SENT";
        await email.save();
        console.log(`Email sent to ${email.to}`);
      } catch (err) {
        email.status = "FAILED";
        email.failureReason = err.message;
        await email.save();
        console.error(`Failed to send email to ${email.to}`);
        console.error(err);
      }
    }
  });
};

module.exports = startScheduler;
