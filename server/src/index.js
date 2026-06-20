import express from "express";
import cors from "cors";
import exercises from "./routes/exercises.js";
import sessions from "./routes/sessions.js";
import analytics from "./routes/analytics.js";

const PORT = process.env.SERVER_PORT || 4000;
const ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:8080";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: ORIGIN }));

app.get("/api/health", (_req, res) => res.json({ ok: true }));

app.use("/api/v1/exercises", exercises);
app.use("/api/v1/sessions", sessions);
app.use("/api/v1/analytics", analytics);

app.listen(PORT, () => {
  console.log(`Workout Tracker API listening on :${PORT} (client origin ${ORIGIN})`);
});
