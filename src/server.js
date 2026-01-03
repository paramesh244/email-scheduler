require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const { scheduleEmailJob } = require("./schedular/emailScheduler");
const Email = require("./models/Email");


const PORT = process.env.PORT || 3000;


const restoreScheduledJobs = async () => {
  try {
    const pendingEmails = await Email.find({
      status: "PENDING",
      scheduledAt: { $gt: new Date() }
    });

    pendingEmails.forEach((email) => {
      try {
        scheduleEmailJob(email);
      } catch (err) {
        console.error(
          `Failed to restore job for email ${email._id}:`,
          err.message
        );
      }
  });
    console.log(`Restored ${pendingEmails.length} scheduled email jobs`);
  } catch (err) {
    console.error("Failed to restore scheduled jobs:", err.message);
  }
};


mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    
    restoreScheduledJobs();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("DB connection error:", err);
  });
