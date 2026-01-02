const express = require("express");
const router = express.Router();
const controller = require("../controllers/emailController");

router.post("/", controller.createEmail);
router.get("/", controller.getEmails);
router.get("/failed", controller.getFailedEmails);
router.get("/:id", controller.getEmailById);
router.put("/:id", controller.updateEmail);
router.delete("/:id", controller.deleteEmail);

module.exports = router;
