import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser } = require("../helpers/authTestingUtils.js");
const { createTestEvent, getUserMadeEvents, getEvent } = require("../helpers/eventsTestingUtils.js");

describe.sequential("api/events/create-event", () => {
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

    it("returns 201 and successfully creates event with all fields", async () => {
        // Create user and event
        const { res: loginRes } = await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        const userId = loginRes.body.user.id;

        const description = "Custom description";
        const image = Buffer.from("fake-image-bytes");

        const { res: createRes } = await createTestEvent(
            agent,
            { description },
            image
        );
        expect(createRes.status).toBe(201);

        // Verify event is created correctly
        const eventId = createRes.body.eventId;
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(getRes.body).toEqual(
            expect.objectContaining({
                id: eventId,
                user_id: userId,
                description,
                imageUrl: `${eventId}/image`
            })
        );
        expect(Buffer.from(getRes.body.image).equals(image)).toBe(true);
    });

    it("returns 201 and successfully creates event without an image", async () => {
        // Create user and event with no image
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: createRes } = await createTestEvent(agent, { }, null);
        expect(createRes.status).toBe(201);

        // Verify event is created with no image
        const eventId = createRes.body.eventId;
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(getRes.body.image ?? null).toBeNull();
        expect(getRes.body.image_mime ?? null).toBeNull();
    });

    it("returns 400 when missing or invalid fields are provided", async () => {
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: res1 } = await createTestEvent(agent, { title: undefined }); // Missing title
        expect(res1.status).toBe(400);

        const { res: res2 } = await createTestEvent(agent, { description: "" }); // Invalid description
        expect(res2.status).toBe(400);

        const { res: res3 } = await createTestEvent(agent, { available_contact: undefined }); // Other missing field
        expect(res3.status).toBe(400);

        // Verify no events were created
        const { res: listRes } = await getUserMadeEvents(agent);
        expect(listRes.status).toBe(200);
        expect(listRes.body).toHaveLength(0);
    });

    it("returns 401 when user is not authenticated", async () => {
        // Attempt to create event without logging in
        const { res: createRes } = await createTestEvent(agent);
        expect(createRes.status).toBe(401);

        // Verify no event is created
        const eventId = createRes.body.eventId;
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(404);
    });
});