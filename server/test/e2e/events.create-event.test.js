import { beforeEach, describe, it, expect, afterEach } from "vitest";
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { } = require("../helpers/authTestingUtils.js");
const { } = require("../helpers/eventsTestingUtils.js");

describe.sequential("api/events/create-event", () => {
    let app;
    let agent;

    // Import app before each test
    beforeEach( async () => {
        app = (await import("../../src/app.js")).default;
        agent = createTestAgent(app);
    });
    
    // Clean up db after each test
    afterEach( async () => {
        await cleanupTestUsers();
        await cleanupTestEvents();
    });

    it.todo("returns 201 and successfully creates event with required fields", async () => {
        
    });

    it.todo("returns 201 and successfully creates event without an image", async () => {

    });

    it.todo("returns 400 when missing or invalid fields are provided", async () => {
        
    });

    it.todo("returns 401 when user is not authenticated", async () => {
        
    });
});