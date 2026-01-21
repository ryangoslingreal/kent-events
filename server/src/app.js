require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRouter = require("./routes/auth");

const app = express();
app.use(express.json());

const allowedOrigin = process.env.CORS_ORIGIN ?? "http://localhost:9000";
app.use(cors({ origin: allowedOrigin }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Route handers
// ! Add more route handers here:
app.use("/api/auth", authRouter);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = Number(process.env.PORT ?? 3001);
app.listen(port, "0.0.0.0", () => {
  console.log(`Server listening on http://0.0.0.0:${port}`);
});