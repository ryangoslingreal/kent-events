import { beforeEach, describe, it, expect, afterEach } from "vitest";
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { } = require("../helpers/eventsTestingUtils.js");

describe.sequential("api/events/get-user-made-events", () => {
    let app;
        
    // Import app before each test
    beforeEach( async () => {
        app = (await import("../../src/app.js")).default;
    });
    
    // Clean up db after each test
    afterEach( async () => {
        await cleanupTestUsers();
        await cleanupTestEvents();
    });

    it.todo("returns 200 with array of events (empty array allowed)", async () => {
        
    });
});