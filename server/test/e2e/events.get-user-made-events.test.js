import { beforeEach, describe, it, expect, afterEach } from "vitest";
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { } = require("../helpers/authTestingUtils.js");
const { } = require("../helpers/eventsTestingUtils.js");

describe.sequential("api/events/get-user-made-events", () => {
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

    it.todo("returns 200 with array of events for authenticated user", async () => {
        
    });

    it.todo("returns 200 with empty array if user has no events", async () => {
        
    });

    it.todo("returns 401 when user is not authenticated", async () => {
        
    });
});