import express from "express";
import { supabase } from "../utils/supabaseClient.js";

const router = express.Router();

// Get selected fields from health_records
router.get("/api/user/health-records", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("health_records")
      .select("disease_name, doctor_name, consulted, id")
      .eq("user_id", '1'); // filter by user_id

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch records" });
    }

    console.log(data);

    res.json({ success: true, records: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
