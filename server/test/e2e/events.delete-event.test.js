import { beforeEach, describe, it, expect, afterEach } from "vitest";
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { } = require("../helpers/authTestingUtils.js");
const { } = require("../helpers/eventsTestingUtils.js");

describe.sequential("api/events/delete-event", () => {
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

    it.todo("returns 200 and deletes existing event", async () => {
        
    });

    it.todo("returns 400 when missing or invalid `eventId` is provided", async () => {
        
    });

    it.todo("returns 401 when user is not authenticated", async () => {
        
    });

    it.todo("returns 403 for unauthorized delete by a different user", async () => {
        
    });

    it.todo("returns 404 for non-existent event", async () => {
        
    });
});