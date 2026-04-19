import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser } = require("../helpers/authTestingUtils.js");
const { getEvent, createTestEvent } = require("../helpers/eventsTestingUtils.js");

describe.sequential("api/events/get-event", () => {
    let app;
    let agent;
        
    // Import app before each test
    beforeEach( async () => {
        inbox.reset();
            
        const {mockEmail} = await import("../setup/email.mock.js");
        mockEmail();
            
        app = (await import("../../src/app.js")).default; // Import app AFTER mock
        agent = createTestAgent(app);
    });
    
    // Clean up db after each test
    afterEach( async () => {
        await cleanupTestEvents();
        await cleanupTestUsers();
    });

    it("returns 200 with event for valid `eventId`", async () => {
        // Create user and event
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: createRes } = await createTestEvent(agent);
        expect(createRes.status).toBe(201);
        const eventId = createRes.body.eventId;

        // Get and verify the event
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(getRes.body.id).toBe(eventId);
        expect(getRes.body.imageUrl).toBe(`${eventId}/image`);
    });

    it("returns 400 when missing or invalid `eventId` is provided", async () => {
        const { res: missingRes } = await getEvent(agent, undefined);
        expect(missingRes.status).toBe(400);

        const { res: invalidRes } = await getEvent(agent, "invalid-id");
        expect(invalidRes.status).toBe(400);
    });

    it("returns 404 for non-existent event", async () => {
        const { res: getRes } = await getEvent(agent, -1);
        expect(getRes.status).toBe(404);
    });
});