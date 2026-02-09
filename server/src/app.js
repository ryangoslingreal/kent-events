require("dotenv").config();
const express = require("express");
const cors = require("cors");

const { registerRoutes } = require("./routes");

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:9000" }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

// Mount feature routes
registerRoutes(app);

// Central error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;

if (require.main === module) {
  const port = Number(process.env.PORT ?? 3001);
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server listening on http://0.0.0.0:${port}`);
  });
}