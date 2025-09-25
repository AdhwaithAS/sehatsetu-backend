import express from "express";
import { supabase } from "../utils/supabaseClient.js";

const router = express.Router();

router.get("/api/user/:phone_no", async (req, res) => {
  try {
    const { phone_no } = req.params; // e.g. /api/user/9876543210
    const { data, error } = await supabase
      .from("patient") // change to your table name
      .select("*")
      .eq("phn_number", phone_no)
      .maybeSingle();
    console.log(data);

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }

    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, user: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
