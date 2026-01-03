const Email = require("../models/Email");
const { scheduleEmailJob,cancelEmailJob } = require("../schedular/emailScheduler");

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidFutureDate = (date) => {
  const parsed = new Date(date);
  return parsed instanceof Date && !isNaN(parsed) && parsed > new Date();
};


// Create email
exports.createEmail = async (req, res) => {

  console.log(("first"))



  const { to, subject, body, scheduledAt } = req.body;

  if (!to || !isValidEmail(to)) {
    return res.status(400).json({ error: "Invalid recipient email" });
  }

  if (!subject || typeof subject !== "string") {
    return res.status(400).json({ error: "Subject is required" });
  }

  if (!body || typeof body !== "string") {
    return res.status(400).json({ error: "Body is required" });
  }

  if (!scheduledAt || !isValidFutureDate(scheduledAt)) {
    return res.status(400).json({
      error: "scheduledAt must be a valid future ISO date"
    });
  }

   console.log(("second"))
  let email;

  try {

    email = await Email.create(req.body);
    console.log("email created")
    scheduleEmailJob(email);
    console.log("job scheduled")
    
    return res.status(201).json({
      success: true,
      message: "Email scheduled successfully",
      data: email
    });

  } 
  catch (err) {
    if (email?._id) {
      await Email.findByIdAndDelete(email._id);
    }

    return res.status(500).json({
      success: false,
      message: "Failed to schedule email please try again",
      error: err.message
    });
  }


}


// Get all emails
exports.getEmails = async (req, res) => {
  try {
    const emails = await Email.find();

    return res.status(200).json(emails);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch emails",
      error: err.message
    });
  }
};


// Get single email
exports.getEmailById = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);

    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found"
      });
    }
    return res.status(200).json(email);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID",
      error: err.message
    });
  }
};




//update or reschedule email

exports.updateEmail = async (req, res) => {
  try {
    const email = await Email.findById(req.params.id);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found"
      });
    }

    if (email.status === "SENT") {
      return res.status(400).json({
        success: false,
        message: "Cannot update a sent email"
      });
    }

    const { to, subject, body, scheduledAt } = req.body;

    if (to !== undefined && !isValidEmail(to)) {
      return res.status(400).json({
        success: false,
        message: "Invalid recipient email"
      });
    }

    if (subject !== undefined && typeof subject !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid subject"
      });
    }

    if (body !== undefined && typeof body !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid email body"
      });
    }

    if (scheduledAt !== undefined && !isValidFutureDate(scheduledAt)) {
      return res.status(400).json({
        success: false,
        message: "scheduledAt must be a valid future ISO date"
      });
    }

    const allowedFields = ["to", "subject", "body", "scheduledAt"];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        email[field] = req.body[field];
      }
    });

    if (scheduledAt !== undefined) {
      email.status = "PENDING";
      email.failureReason = undefined;
    }


    cancelEmailJob(email._id.toString());  //cancelling existing job

    Object.assign(email, req.body);
    email.status = "PENDING";
    await email.save();

    scheduleEmailJob(email);  //schedule new job


    return res.status(200).json({
      success: true,
      message: "Email re-scheduled successfully",
      data: email
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: "Failed to update email",
      error: err.message
    });
  }
};


// Delete email
exports.deleteEmail = async (req, res) => {
  try {
    const emailId = req.params.id;

    const email = await Email.findById(emailId);
    if (!email) {
      return res.status(404).json({
        success: false,
        message: "Email not found"
      });
    }

    cancelEmailJob(emailId);

    await Email.findByIdAndDelete(emailId);

    return res.status(200).json({
      success: true,
      message: "Email deleted successfully"
    });
  } 
  catch (err) {
    return res.status(400).json({
      success: false,
      message: "Invalid email ID",
      error: err.message
    });
  }
};



// Failed / Unsent emails
exports.getFailedEmails = async (req, res) => {
  try {
    const emails = await Email.find({
      $or: [
        { status: "FAILED" },
        { status: "PENDING", scheduledAt: { $lt: new Date() } }
      ]
    });

    return res.status(200).json(emails);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch failed emails",
      error: err.message
    });
  }
};

