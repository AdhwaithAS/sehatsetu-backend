import express from "express";
import { supabase } from "../utils/supabaseClient.js";

const router = express.Router();

// Get a single health record by id
router.get("/api/user/health-records/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from("health_records")
      .select("*") // get all fields
      .eq("id", id) // filter by id
      .single();    // expect only one record
    console.log(data);
    
    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch record" });
    }

    if (!data) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ success: true, record: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
