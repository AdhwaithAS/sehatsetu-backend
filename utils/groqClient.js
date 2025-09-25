import axios from "axios";


export const groqClient = axios.create({
  baseURL: "https://api.groq.com/openai/v1", // Groq exposes OpenAI-compatible endpoints.
  headers: {
    Authorization: `Bearer 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`,
    "Content-Type": "application/json",
  },
});
