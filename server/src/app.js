require("dotenv").config();
const express = require("express");
const cors = require("cors");
const eventsRouter = require("./routes/events");

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:9000";
app.use(cors({ origin: allowedOrigin }));

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Routes
app.use("/api/events", eventsRouter);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});