import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser, logoutTestUser } = require("../helpers/authTestingUtils.js");
const { createTestEvent, updateTestEvent, getEvent } = require("../helpers/eventsTestingUtils.js");

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
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const originalDescription = "Created from the update-event test";
        const updatedDescription = "Updated from the update-event test";

        const { res: createRes } = await createTestEvent(
            agent,
            { description: originalDescription }
        );
        eventId = createRes.body.eventId;
        expect(createRes.status).toBe(201);

        // Update event
        const { res: updateRes } = await updateTestEvent(
            agent,
            eventId,
            { description: updatedDescription }
        );
        expect(updateRes.status).toBe(200);

        // Verify event is updated
        const { res: getRes } = await getEvent(agent, createRes.body.eventId);
        expect(getRes.body.description).toBe(updatedDescription);
    });

    it("returns 200 and preserves image when updating without a new one", async () => {
        // Create user and event with image
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const image = Buffer.from("fake-image-bytes");

        const { res: createRes } = await createTestEvent(agent, { }, image);
        expect(createRes.status).toBe(201);

        const { res: getRes1 } = await getEvent(agent, createRes.body.eventId);
        expect(getRes1.status).toBe(200);
        expect(getRes1.body.image).toBeTruthy();

        // Update event without providing new image
        const { res: updateRes } = await updateTestEvent(agent, createRes.body.eventId);
        expect(updateRes.status).toBe(200);

        // Verify image unchanged
        const { res: getRes2 } = await getEvent(agent, createRes.body.eventId);
        expect(getRes2.status).toBe(200);
        expect(getRes2.body.image).toBeTruthy();
        
        const originalImage = Buffer.from(getRes1.body.image);
        const preservedImage = Buffer.from(getRes2.body.image);
        expect(preservedImage.equals(originalImage)).toBe(true);
    });

    it("returns 200 and replaces image when updating with a new one", async () => {
        // Create user and event with image
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const image1 = Buffer.from("original-image-bytes");
        const image2 = Buffer.from("updated-image-bytes");

        const { res: createRes } = await createTestEvent(agent, { }, image1);
        expect(createRes.status).toBe(201);
        const eventId = createRes.body.eventId;

        const { res: getRes1 } = await getEvent(agent, eventId);
        expect(getRes1.status).toBe(200);
        expect(getRes1.body.image).toBeTruthy();

        // Update event with new image
        const { res: updateRes } = await updateTestEvent(
            agent, 
            eventId, 
            {},
            image2
        );
        expect(updateRes.status).toBe(200);

        // Verify image replaced
        const { res: getRes2 } = await getEvent(agent, eventId);
        expect(getRes2.body.image).toBeTruthy();

        const beforeUpdate = Buffer.from(getRes1.body.image);
        const afterUpdate = Buffer.from(getRes2.body.image);
        expect(afterUpdate.equals(beforeUpdate)).toBe(false);
        expect(afterUpdate.equals(afterUpdate)).toBe(true);
    });

    it("returns 400 when missing or invalid `eventId` is provided", async () => {
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

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
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        
        const originalDescription = "Created from the update-event test";
        const updatedDescription = "Unauthenticated update attempt";

        const { res: createRes } = await createTestEvent(
            agent,
            { description: originalDescription }
        );
        expect(createRes.status).toBe(201);
        const eventId = createRes.body.eventId;
        
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
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const originalDescription = "Created from the update-event test";
        const updatedDescription = "Unauthorized update attempt";

        const { res: createRes } = await createTestEvent(
            agent, 
            { description: originalDescription }
        );
        expect(createRes.status).toBe(201);
        const eventId = createRes.body.eventId;

        // Log out User 1 and attempt update as User 2
        await logoutTestUser(agent);
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
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
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        const { res: updateRes } = await updateTestEvent(
            agent,
            -1,
            { description: "This event shouldn't exist" }
        );
        expect(updateRes.status).toBe(404);
    });
});