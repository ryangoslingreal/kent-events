// ! Import routers here:
const authRouter = require("./auth");

// Feature route registration
function registerRoutes(app) {
    // ! Register future routes here:
    app.use("/api/auth", authRouter);
}

module.exports = { registerRoutes };