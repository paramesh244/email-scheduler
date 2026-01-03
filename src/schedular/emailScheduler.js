const schedule = require("node-schedule");
const Email = require("../models/Email");
const { sendEmail } = require("../services/emailService");




const scheduledJobs = new Map();   //Map<emailId, scheduledJob>

const scheduleEmailJob = (email) => {
  const job = schedule.scheduleJob(
    email._id.toString(),
    new Date(email.scheduledAt),
    async () => {
      try {
        await sendEmail(email);
        await Email.findByIdAndUpdate(email._id, {
          status: "SENT"
        });
      } catch (err) {
        await Email.findByIdAndUpdate(email._id, {
          status: "FAILED",
          failureReason: err.message
        });
      } finally {
        scheduledJobs.delete(email._id.toString());
      }
    }
  );

  scheduledJobs.set(email._id.toString(), job);
  console.log('Scheduled emails', scheduledJobs);
};

const cancelEmailJob = (emailId) => {
  const job = scheduledJobs.get(emailId);
  if (job) {
    job.cancel();
    scheduledJobs.delete(emailId);
  }
};



module.exports = {
  scheduleEmailJob,
  cancelEmailJob,
};
