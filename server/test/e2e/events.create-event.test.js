import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser } = require("../helpers/authTestingUtils.js");
const { createTestEvent, getUserMadeEvents, getEvent } = require("../helpers/eventsTestingUtils.js");

const TEST_PREFIX = process.env.TEST_PREFIX;

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

    it("returns 201 and successfully creates event with required fields", async () => {
        const { res: loginRes } = await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        // * NOTE: This relies on loginRes containing the user id
        // * as part of the respose body, which may change in the future.
        // * If it does, we will need to use the session to track the
        // * logged in user.
        const userId = loginRes.body.user.id;

        const title = `${TEST_PREFIX} create-event with image`;
        const description = "Created from the create-event test";
        const image = Buffer.from("fake-image-bytes");

        const { res } = await createTestEvent(
            agent,
            {
                title,
                description
            },
            image
        );

        expect(res.status).toBe(201);

        const { res: listRes } = await getUserMadeEvents(agent);
        expect(listRes.status).toBe(200);
        expect(listRes.body).toHaveLength(1);
        expect(listRes.body[0].title).toBe(title);

        const eventId = listRes.body[0].id;
        expect(eventId).toBeTruthy();

        const { res: eventRes } = await getEvent(agent, eventId);
        expect(eventRes.status).toBe(200);
        expect(eventRes.body).toEqual(
            expect.objectContaining({
                id: eventId,
                user_id: userId,
                title,
                description,
                imageUrl: `${eventId}/image`
            })
        );
        expect(eventRes.body.image).toBeTruthy();
    });

    it("returns 201 and successfully creates event without an image", async () => {
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const title = `${TEST_PREFIX} create-event without image`;
        const description = "Created from the create-event test";

        const { res } = await createTestEvent(
            agent,
            {
                title,
                description,
                image_mime: undefined
            },
            null
        );

        expect(res.status).toBe(201);

        const { res: listRes } = await getUserMadeEvents(agent);
        expect(listRes.status).toBe(200);
        expect(listRes.body).toHaveLength(1);
        expect(listRes.body[0].title).toBe(title);

        const eventId = listRes.body[0].id;
        expect(eventId).toBeTruthy();

        const { res: eventRes } = await getEvent(agent, eventId);
        expect(eventRes.status).toBe(200);
        expect(eventRes.body).toEqual(
            expect.objectContaining({
                id: eventId,
                title,
                description,
                imageUrl: `${eventId}/image`
            })
        );
        expect(eventRes.body.image ?? null).toBeNull();
        expect(eventRes.body.image_mime ?? null).toBeNull();
    });

    it("returns 400 when missing or invalid fields are provided", async () => {
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: res1 } = await createTestEvent(agent, { title: undefined }, null);
        expect(res1.status).toBe(400);

        const { res: res2 } = await createTestEvent(agent, { description: "" }, null);
        expect(res2.status).toBe(400);

        const { res: res3 } = await createTestEvent(agent, { available_contact: undefined }, null);
        expect(res3.status).toBe(400);

        const { res: listRes } = await getUserMadeEvents(agent);
        expect(listRes.status).toBe(200);
        expect(listRes.body).toHaveLength(0);
    });

    it("returns 401 when user is not authenticated", async () => {
        const title = `${TEST_PREFIX} create-event unauthenticated`;
        const { res } = await createTestEvent(agent, { title }, null);

        expect(res.status).toBe(401);
    });
});