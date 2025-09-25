import express from "express";
import { supabase } from "../utils/supabaseClient.js";
import { otpStore } from "./login.js"; // shared store

const router = express.Router();

router.post("/api/user/verify-otp", async (req, res) => {
  try {
    const phone = req.body.phoneNumber;
    const otp = req.body.otp;

    if (!phone || !otp) {
      return res.status(400).json({ error: "Phone and OTP required" });
    }

    const otpData = otpStore[phone];

    if (!otpData) {
      return res.status(400).json({ error: "No OTP requested for this phone" });
    }

    if (Date.now() > otpData.expires) {
      delete otpStore[phone];
      return res.status(401).json({ error: "OTP expired" });
    }

    // Validate OTP
    if (otpData.otp !== otp) {
      return res.status(401).json({ error: "Invalid OTP" });
    }

    // OTP correct → clear store
    delete otpStore[phone];

    // Set login cookie
    res.cookie("session_token", "dummy_session_token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // Update Supabase (mark verified)
    const { data, error } = await supabase
      .from("patient")
      .update({ is_loggedin: true })
      .eq("phn_number", phone);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "DB update failed" });
    }

    res.json({
      success: true,
      message: "OTP verified, user logged in",
      user: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
