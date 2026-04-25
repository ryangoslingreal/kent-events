import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { createTestUserAndEvent } = require("../helpers/scenarioTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser } = require("../helpers/authTestingUtils.js");
const { getEvent } = require("../helpers/eventsTestingUtils.js");

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
        // Create user and event with image
        const image = Buffer.from("fake-image-bytes");
        const { userRes, eventRes } = await createTestUserAndEvent(agent, { image });
        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);
        
        const eventId = eventRes.body.eventId;

        // Get and verify the event
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(getRes.body.id).toBe(eventId);
        expect(getRes.body.image).toEqual(
            expect.objectContaining({
                url: expect.stringContaining(`/api/events/${eventId}/image?v=`),
                kind: "upload"
            })
        );
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