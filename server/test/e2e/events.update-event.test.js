import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser, logoutTestUser } = require("../helpers/authTestingUtils.js");
const { createTestEvent, updateTestEvent, getEvent } = require("../helpers/eventsTestingUtils.js");

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
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        const title = `${TEST_PREFIX} update-event`;
        const originalDescription = "Created from the update-event test";
        const updatedDescription = "Updated from the update-event test";

        const { res: createRes } = await createTestEvent(
            agent,
            { title, description: originalDescription }
        );
        expect(createRes.status).toBe(201);

        // Update event
        const { res: updateRes } = await updateTestEvent(
            agent,
            createRes.body.eventId,
            { description: updatedDescription }
        );

        // Verify update succeeded and persisted
        expect(updateRes.status).toBe(200);
        const { res: getRes } = await getEvent(agent, createRes.body.eventId);
        expect(getRes.body.description).toBe(updatedDescription);
    });

    it("returns 200 and preserves image when updating without a new one", async () => {
        // Create user and event with image
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        const title = `${TEST_PREFIX} update-event no-replace image`;
        const image = Buffer.from("fake-image-bytes");

        const { res: createRes } = await createTestEvent(agent, { title }, image);
        expect(createRes.status).toBe(201);

        const { res: getRes1 } = await getEvent(agent, createRes.body.eventId);
        expect(getRes1.body.image).toBeTruthy();
        const originalImage = getRes1.body.image;

        // Update event without providing new image
        const { res: updateRes } = await updateTestEvent(agent, createRes.body.eventId);

        // Verify image unchanged
        expect(updateRes.status).toBe(200);
        const { res: getRes2 } = await getEvent(agent, createRes.body.eventId);
        expect(getRes2.body.image).toBe(originalImage);
    });

    it("returns 200 and replaces existing image when updating with a new one", async () => {
        // Create user and event with image
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        const title = `${TEST_PREFIX} update-event replace image`;
        const originalImage = Buffer.from("original-image-bytes");
        const updatedImage = Buffer.from("updated-image-bytes");

        const { res: createRes } = await createTestEvent(agent, { title }, originalImage);
        expect(createRes.status).toBe(201);

        const { res: getRes1 } = await getEvent(agent, createRes.body.eventId);
        expect(getRes1.body.image).toBeTruthy();

        // Update event with new image
        const { res: updateRes } = await updateTestEvent(
            agent, 
            createRes.body.eventId, 
            {},
            updatedImage
        );

        // Verify image replaced
        expect(updateRes.status).toBe(200);
        const { res: getRes2 } = await getEvent(agent, createRes.body.eventId);
        expect(getRes2.body.image).toBeTruthy();
        expect(getRes2.body.image).not.toBe(getRes1.body.image); // Ensure image has changed
    });

    it("returns 400 when missing or invalid `eventId` is provided", async () => {
        // Create authenticated user
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        // Missing `eventId`
        const { res: missingRes } = await updateTestEvent(
            agent,
            undefined,
            { description: "New description" }
        );
        expect(missingRes.status).toBe(400);

        // Invalid `eventId` (non-numeric)
        const { res: invalidRes } = await updateTestEvent(
            agent,
            "not-a-number",
            { description: "New description" }
        );
        expect(invalidRes.status).toBe(400);
    });

    it("returns 401 when user is not authenticated", async () => {
        // Create event as authenticated user
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        const { res: createRes } = await createTestEvent(agent);
        expect(createRes.status).toBe(201);
        
        // Logout and attempt update
        await logoutTestUser(agent);
        const { res: updateRes } = await updateTestEvent(agent, createRes.body.eventId);
        expect(updateRes.status).toBe(401);
    });

    it("returns 403 for unauthorized update by a different user", async () => {
        // User 1 creates event
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        const { res: createRes } = await createTestEvent(agent);
        expect(createRes.status).toBe(201);
        const eventId = createRes.body.eventId;

        // Logout User 1 and log in as User 2
        await logoutTestUser(agent);
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        // User 2 attempts to update User 1's event
        const { res: updateRes } = await updateTestEvent(agent, eventId);
        expect(updateRes.status).toBe(403);
    });

    it("returns 404 for non-existent event", async () => {
        // Create user and attempt to update non-existent event
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: updateRes } = await updateTestEvent(
            agent,
            -1, // Non-existent ID
            { description: "This event shouldnt exist" }
        );
        expect(updateRes.status).toBe(404);
    });
});