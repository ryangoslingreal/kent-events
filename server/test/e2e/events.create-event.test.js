import { beforeEach, describe, it, expect, afterEach } from "vitest";
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { } = require("../helpers/eventsTestingUtils.js");

describe.sequential("api/events/create-event", () => {
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

    it.todo("returns 201 and successfully creates event with required fields", async () => {

    });

    it.todo("returns 400 when missing or invalid fields are provided", async () => {
        
    });
});