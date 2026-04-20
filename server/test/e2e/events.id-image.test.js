import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { createTestUserAndEvent } = require("../helpers/scenarioTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser } = require("../helpers/authTestingUtils.js");
const { getEventImage, createTestEvent } = require("../helpers/eventsTestingUtils.js");

describe.sequential("api/events/:id/image", () => {
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

    it("returns 200 with image for valid `eventId`", async () => {
        // Create user and event with image
        const image = Buffer.from("fake-image-bytes");

        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            image
        });

        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        // Get and verify the image
        const { res: imageRes } = await getEventImage(agent, eventId);
        expect(imageRes.status).toBe(200);

        expect(imageRes.body.equals(image)).toBe(true);
        expect(imageRes.headers["content-type"]).toBe("image/png");
        expect(imageRes.headers["cache-control"]).toBe("public, max-age=86400");
    });

    it("returns 404 when event does not exist", async () => {
        const { res: imageRes } = await getEventImage(agent, -1);
        expect(imageRes.status).toBe(404);
    });

    it("returns 404 when event has no image", async () => {
        // Create user and event without image
        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            image: null
        });
        
        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        // Attempt to get image
        const { res: imageRes } = await getEventImage(agent, eventId);
        expect(imageRes.status).toBe(404);
    });
});