require("./env");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const { registerRoutes } = require("./routes");

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? "http://localhost:9000" }));

// Session config
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

app.use(session({
  secret: process.env.SESSION_SECRET || "test-secret",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // ! Set to TRUE in prod
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

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