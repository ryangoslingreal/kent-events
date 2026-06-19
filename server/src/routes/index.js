// ! Import routers here:
const authRouter = require("./auth");
const eventsRouter = require("./events");

const { runScrapersOnStartup } = require("./scrapers");

// Feature route registration
function registerRoutes(app) {
    // ! Register future routes here:
    app.use("/api/auth", authRouter);
    app.use("/api/events", eventsRouter);
    
    // Internal startup
    runScrapersOnStartup();
}

module.exports = { registerRoutes };