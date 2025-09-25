import express from "express";

const router = express.Router();

export const otpStore = {};

router.post("/api/user/login", async (req, res) => {
  try {
    const phone = req.body.phoneNumber;
    if (!phone) {
      return res.status(400).json({ error: "Phone number required" });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP with 5 min expiry
    otpStore[phone] = {
      otp,
      expires: Date.now() + 5 * 60 * 1000,
    };

    console.log(`OTP for ${phone}: ${otp}`); // Debug only

    res.json({ success: true, message: `OTP sent to ${phone}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
