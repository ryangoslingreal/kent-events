require("./env");
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const cron = require('node-cron');
const { scrape: scrapeKSU } = require('./scrapers/scrapeKSU.js');
const { scrape: scrapeUniEvents} = require('./scrapers/scrapeUniEvents.js')
const eventsRepo = require('./repos/eventsRepo');

const { registerRoutes } = require("./routes");

const app = express();
app.use(express.json());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN ?? "http://localhost:9000",
  credentials: true
}));

// Session config
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
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
}));

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


//scraping 
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
let lastScrape
(async () => {
  lastScrape = await eventsRepo.lastScrapeTime()

  if (!lastScrape || lastScrape < oneDayAgo){

        try {
            console.log('Initial scrape Kent Uni starting...');
            const uniEvents = await scrapeUniEvents();
            await eventsRepo.saveKSUEvents(uniEvents);
            console.log(`Initial scrape done - saved ${uniEvents.length} events`);
        } catch (err) {
            console.error('Initial scrape failed:', err.message);
        }

        try {
            console.log('Initial scrape KSU starting...');
            const ksuEvents = await scrapeKSU();
            await eventsRepo.saveKSUEvents(ksuEvents);
            console.log(`Initial scrape done - saved ${ksuEvents.length} events`);
        } catch (err) {
            console.error('Initial scrape failed:', err.message);
        }
  } else {
    console.log('Scrape skipped - ran recently')
  }
})();

