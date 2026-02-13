// ! Import routers here:
const authRouter = require("./auth");
const eventsRouter = require("./events");

// Feature route registration
function registerRoutes(app) {
    // ! Register future routes here:
    app.use("/api/auth", authRouter);
    app.use("/api/events", eventsRouter);
}

module.exports = { registerRoutes };
