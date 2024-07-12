const express = require("express");
const { createReferral } = require("../controllers/referralController");
const router = express.Router();

router.get("/test", (req, res) => {
  res.status(200).json({ message: "Test route working!" });
});

router.post("/referrals", createReferral);

module.exports = router;
