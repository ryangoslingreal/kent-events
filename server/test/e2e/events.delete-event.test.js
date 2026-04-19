import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser, logoutTestUser } = require("../helpers/authTestingUtils.js");
const { createTestEvent, deleteTestEvent, getEvent } = require("../helpers/eventsTestingUtils.js");

describe.sequential("api/events/delete-event", () => {
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

    it("returns 200 and deletes existing event", async () => {
        // Create user and event
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: createRes } = await createTestEvent(agent);
        expect(createRes.status).toBe(201);
        const eventId = createRes.body.eventId;

        // Delete the event
        const { res: deleteRes } = await deleteTestEvent(agent, eventId);
        expect(deleteRes.status).toBe(200);

        // Verify event is deleted
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(404);
    });

    it("returns 400 when missing or invalid `eventId` is provided", async () => {
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: missingRes } = await deleteTestEvent(agent, undefined);
        expect(missingRes.status).toBe(400);

        const { res: invalidRes } = await deleteTestEvent(agent, "invalid-id");
        expect(invalidRes.status).toBe(400);
    });

    it("returns 401 when user is not authenticated", async () => {
        // Create user and event
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");
        const { res: createRes } = await createTestEvent(agent);
        expect(createRes.status).toBe(201);
        const eventId = createRes.body.eventId;

        // Logout and attempt delete
        await logoutTestUser(agent);
        const { res: deleteRes } = await deleteTestEvent(agent, eventId);
        expect(deleteRes.status).toBe(401);

        // Verify event still exists
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(getRes.body.id).toBe(eventId);
    });

    it("returns 403 for unauthorized delete by a different user", async () => {
        // User 1 creates event
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: createRes } = await createTestEvent(agent);
        expect(createRes.status).toBe(201);
        const eventId = createRes.body.eventId;

        // Log out User 1 and log in as User 2
        await logoutTestUser(agent);
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        // User 2 attempts to delete User 1's event
        const { res: deleteRes } = await deleteTestEvent(agent, eventId);
        expect(deleteRes.status).toBe(403);

        // Verify event still exists
        const { res: getRes } = await getEvent(agent, eventId);
        expect(getRes.status).toBe(200);
        expect(getRes.body.id).toBe(eventId);
    });

    it("returns 404 for non-existent event", async () => {
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: deleteRes } = await deleteTestEvent(agent, -1);
        expect(deleteRes.status).toBe(404);
    });
});