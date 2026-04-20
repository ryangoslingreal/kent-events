import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { createTestUserAndEvent } = require("../helpers/scenarioTestingUtils.js");
const { registerAndLoginTestUser } = require("../helpers/authTestingUtils.js");
const { createTestEvent, getUserMadeEvents, getEvent, normaliseEvent } = require("../helpers/eventsTestingUtils.js");

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

    it("returns 201 and successfully creates event with all fields", async () => {
        // Create user and event
        const title = `${TEST_PREFIX} Custom title`; // Need prefix for db cleanup
        const subtitle = "Custom subtitle";
        const description = "Custom description";
        const event_date = "2033-01-01";
        const event_time = "00:00";
        const location = "Custom location";
        const tags = ["custom", "tags"];
        const price = "10";
        const repeat_event = "weekly";
        const available_contact = false;
        const image = Buffer.from("fake-image-bytes");

        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            eventPayload: {
                title,
                subtitle,
                description,
                event_date,
                event_time,
                location,
                tags,
                price,
                repeat_event,
                available_contact
            }, 
            image
        });

        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const userId = userRes.body.user.id;
        const eventId = eventRes.body.eventId;

        // Verify event is created correctly
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(normaliseEvent(getRes.body)).toEqual(
            expect.objectContaining({
                id: eventId,
                user_id: userId,
                title,
                subtitle,
                description,
                event_date,
                event_time,
                location,
                tags,
                price,
                repeat_event,
                available_contact,
                image_mime: "image/png"
            })
        );
        expect(Buffer.from(getRes.body.image).equals(image)).toBe(true);
    });

    it("returns 201 and successfully creates event without an image", async () => {
        // Create user and event with no image
        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            image: null
        });
        
        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        // Verify event is created with no image
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(getRes.body.image ?? null).toBeNull();
        expect(getRes.body.image_mime ?? null).toBeNull();
    });

    it("returns 400 when missing or invalid fields are provided", async () => {
        await registerAndLoginTestUser(agent);

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
    });
});