import { beforeEach, describe, it, expect, afterEach } from "vitest";
import { register } from "../../../client/src/api.js";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser } = require("../helpers/authTestingUtils.js");
const { createTestEvent, getAllEvents } = require("../helpers/eventsTestingUtils.js");

describe.sequential("api/events/get-all-events", () => {
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

    it("returns 200 with upcoming events", async () => {
        // Create user and event
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: createFutureRes } = await createTestEvent(agent, { event_date: "2077-05-01" });
        const futureEventId = createFutureRes.body.eventId;
        expect(createFutureRes.status).toBe(201);

        const { res: createPastRes } = await createTestEvent(agent, { event_date: "2000-01-01" });
        const pastEventId = createPastRes.body.eventId;
        expect(createPastRes.status).toBe(201);

        // Get all events and verify only the future event is returned
        const { res: getAllRes } = await getAllEvents(agent);
        expect(getAllRes.status).toBe(200);

        const pastEvent = getAllRes.body.find(e => e.id === pastEventId);
        expect(pastEvent).toBeUndefined(); // Past event should not be included

        const futureEvent = getAllRes.body.find(e => e.id === futureEventId);
        expect(futureEvent).toBeDefined();

        expect(futureEvent).toEqual(
            expect.objectContaining({
                id: futureEventId,
                imageUrl: `${futureEventId}/image`
            })
        );

        expect(futureEvent).not.toHaveProperty("image"); // Image should not be included
    });

    it.skip("returns 404 when no upcoming events exist", async () => {
        // * NOTE: Skipped the 404 test because the shared DB prevents a reliable empty dataset.
    });
});