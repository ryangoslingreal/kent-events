import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { createTestUserAndEvent } = require("../helpers/scenarioTestingUtils.js");
const { registerAndLoginTestUser, logoutTestUser } = require("../helpers/authTestingUtils.js");
const { updateTestEvent, getEvent, getEventImage, normaliseEvent } = require("../helpers/eventsTestingUtils.js");

const TEST_PREFIX = process.env.TEST_PREFIX;

describe.sequential("api/events/update-event", () => {
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

    it("returns 200 and updates event details", async () => {
        // Create user and event
        const { userRes, eventRes } = await createTestUserAndEvent(agent);
        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        // Update event
        const title = `${TEST_PREFIX} New title`; // Need prefix for db cleanup
        const subtitle = "New subtitle";
        const description = "New description";
        const event_date = "2033-01-01";
        const event_time = "00:00";
        const location = "New location";
        const tags = ["new", "tags"];
        const price = "10";
        const repeat_event = "weekly";
        const available_contact = false;

        const { res: updateRes } = await updateTestEvent(
            agent,
            eventId,
            {
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
            }
        );

        expect(updateRes.status).toBe(200);

        // Verify event is updated
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(normaliseEvent(getRes.body)).toEqual(
            expect.objectContaining({
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
            })
        );
    });

    it("returns 200 and preserves image when updating without a new one", async () => {
        // Create user and event with image
        const image = Buffer.from("fake-image-bytes");

        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            image
        });

        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        const { res: getRes1 } = await getEvent(agent, eventId);
        expect(getRes1.status).toBe(200);
        expect(getRes1.body.image).toBeTruthy();

        // Update event without providing new image
        const { res: updateRes } = await updateTestEvent(
            agent,
            eventId,
            { description: "Updated description" }
        );

        expect(updateRes.status).toBe(200);

        // Verify image unchanged
        const { res: getRes2 } = await getEvent(agent, eventId);
        expect(getRes2.status).toBe(200);
        expect(getRes2.body.image).toBeTruthy();
        
        const originalImage = Buffer.from(getRes1.body.image);
        const preservedImage = Buffer.from(getRes2.body.image);
        expect(preservedImage.equals(originalImage)).toBe(true);
    });

    it("returns 200 and replaces image when updating with a new one", async () => {
        // Create user and event with image
        const image1 = Buffer.from("original-image-bytes");
        const image2 = Buffer.from("updated-image-bytes");

        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            image: image1
        });

        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        const { res: getRes1 } = await getEvent(agent, eventId);
        expect(getRes1.status).toBe(200);
        expect(getRes1.body.image).toBeTruthy();

        // Update event with new image
        const { res: updateRes } = await updateTestEvent(
            agent, 
            eventId, 
            { description: "New image" },
            image2
        );

        expect(updateRes.status).toBe(200);

        // Verify image replaced
        const { res: getRes2 } = await getEvent(agent, eventId);
        expect(getRes2.body.image).toBeTruthy();

        const beforeUpdate = Buffer.from(getRes1.body.image);
        const afterUpdate = Buffer.from(getRes2.body.image);
        expect(afterUpdate.equals(beforeUpdate)).toBe(false);
        expect(afterUpdate.equals(image2)).toBe(true);
    });

    it("returns 200 and clears image when `remove_image=true`", async () => {
        // Create user and event with image
        const image = Buffer.from("image-to-clear");

        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            image
        });

        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        const { res: getRes1 } = await getEvent(agent, eventId);
        expect(getRes1.status).toBe(200);
        expect(getRes1.body.image).toBeTruthy();

        // Update event and clear image
        const { res: updateRes } = await updateTestEvent(
            agent,
            eventId,
            { remove_image: true }
        );

        expect(updateRes.status).toBe(200);

        // Verify image has been cleared
        const { res: getRes2 } = await getEvent(agent, eventId);
        expect(getRes2.status).toBe(200);
        expect(getRes2.body.image ?? null).toBeNull();
        expect(getRes2.body.image_mime ?? null).toBeNull();

        const { res: imageRes } = await getEventImage(agent, eventId);
        expect(imageRes.status).toBe(204);
    });    

    it("returns 400 when `remove_image=true` and a new image are sent", async () => {
        // Create user and event with image
        const originalImage = Buffer.from("original-image");

        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            image: originalImage
        });

        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        const replacementImage = Buffer.from("replacement-image");

        // Attempt to update event and clear image with an image
        const { res: updateRes } = await updateTestEvent(
            agent,
            eventId,
            { remove_image: true },
            replacementImage
        );

        expect(updateRes.status).toBe(400);

        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(getRes.body.image).toBeTruthy();

        const storedImage = Buffer.from(getRes.body.image);
        expect(storedImage.equals(originalImage)).toBe(true);
    });

    it("returns 400 when missing or invalid `eventId` is provided", async () => {
        await registerAndLoginTestUser(agent);

        const { res: missingRes } = await updateTestEvent(
            agent,
            undefined,
            { description: "Missing eventId" }
        );

        expect(missingRes.status).toBe(400);

        const { res: invalidRes } = await updateTestEvent(
            agent,
            "not-a-number",
            { description: "Invalid eventId" }
        );
        
        expect(invalidRes.status).toBe(400);
    });

    it("returns 401 when user is not authenticated", async () => {
        // Create user and event
        const originalDescription = "Created from the update-event test";
        const updatedDescription = "Unauthenticated update attempt";

        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            eventPayload: { description: originalDescription }
        });

        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        // Logout and attempt update
        await logoutTestUser(agent);

        const { res: updateRes } = await updateTestEvent(
            agent,
            eventId,
            { description: updatedDescription }
        );

        expect(updateRes.status).toBe(401);

        // Verify no update occurred
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(getRes.body.description).toBe(originalDescription);
    });

    it("returns 403 for unauthorized update by a different user", async () => {
        // User 1 creates event
        const originalDescription = "Created from the update-event test";
        const updatedDescription = "Unauthorized update attempt";

        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            eventPayload: { description: originalDescription }
        });
        
        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        // Logout User 1 and attempt update as User 2
        await logoutTestUser(agent);

        await registerAndLoginTestUser(agent);
        const { res: updateRes } = await updateTestEvent(
            agent,
            eventId,
            { description: updatedDescription }
        );

        expect(updateRes.status).toBe(403);

        // Verify no update occurred
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(getRes.body.description).toBe(originalDescription);
    });

    it("returns 404 for non-existent event", async () => {
        // Create user and attempt to update non-existent event
        await registerAndLoginTestUser(agent);
        
        const { res: updateRes } = await updateTestEvent(
            agent,
            -1,
            { description: "This event shouldn't exist" }
        );

        expect(updateRes.status).toBe(404);
    });
});