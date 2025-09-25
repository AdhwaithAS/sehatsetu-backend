// routes/symptomChecker.js
import express from "express";
import { groqClient } from "../utils/groqClient.js";
import { Groq } from "groq-sdk";
const groq = new Groq({
  apiKey: "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",
});
const router = express.Router();

router.post("/api/symptom-check", async (req, res) => {
  try {
    const { symptoms, age, gender } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ error: "Please provide symptoms" });
    }

    // Prompt for Groq model
    const prompt = `
You are a helpful medical triage assistant.  
The user will provide symptoms and basic details.  
Return a JSON ONLY, with this structure:

{
  "disease": "<most likely disease/condition>",
  "possible_conditions": [
    {"name": "<condition>", "confidence_percent": <0-100>}
  ],
  "treatment": [
    "<simple home-care or treatment steps>",
    "<when to see a doctor>"
  ],
  "red_flags": ["<dangerous warning signs>"],
  "disclaimer": "This is NOT medical advice. Always consult a doctor."
}
`;

    const userContent = `Symptoms: ${symptoms}
Age: ${age ?? "unknown"}
Gender: ${gender ?? "unknown"}
`;

    // Call Groq model
    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant", // fast medical reasoning
      messages: [{ role: "user", content: prompt + userContent }],
      
      temperature: 0.4,
    });

    const output = completion.choices[0].message.content;

    res.json({ result: output });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

export default router;
