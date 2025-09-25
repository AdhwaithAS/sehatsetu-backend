import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "http";
import userLogin from "./routes/login.js";
import verifyOtp from "./routes/verify-top.js";
import healthRecords from "./routes/healthRecord.js";
import healthRecordByID from "./routes/healthRecordByID.js";
import getProfile from './routes/getProfile.js'
import symptomChecker from './routes/symptomChecker.js'
import videoCall, { setupSocketIO } from './routes/videoCall.js'
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: "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",
});

const app = express();
const port = 3001;
import cors from "cors";
const allowedOrigins = [
  "http://localhost:3000", // dev
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));
app.use("/", userLogin);
app.use("/", verifyOtp);
app.use("/", healthRecords);
app.use("/", healthRecordByID);
app.use("/", getProfile);
app.use("/", symptomChecker);
app.use("/", videoCall);

// Create HTTP server and setup Socket.IO
const server = createServer(app);
const io = setupSocketIO(server);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`Socket.IO server ready for video calls`);
});
