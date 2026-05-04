import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { createTestUserAndEvent } = require("../helpers/scenarioTestingUtils.js");
const { registerAndLoginTestUser } = require("../helpers/authTestingUtils.js");
const { getAllEvents, createTestEvent } = require("../helpers/eventsTestingUtils.js");

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

    it("returns 200 with array of upcoming events", async () => {
        // Create user and events
        await registerAndLoginTestUser(agent);

        const image = Buffer.from("future-image-bytes");
        const { res: createFutureRes } = await createTestEvent(agent, { date: "2077-05-01" }, image);
        expect(createFutureRes.status).toBe(201);

        const { res: createPastRes } = await createTestEvent(agent, { date: "2000-01-01" });
        expect(createPastRes.status).toBe(201);

        const futureEventId = createFutureRes.body.eventId;
        const pastEventId = createPastRes.body.eventId;

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
                image: expect.objectContaining({
                    url: expect.stringContaining(`/api/events/${futureEventId}/image?v=`),
                    kind: "upload"
                })
            })
        );
    });

    it("returns 200 with empty array when no upcoming events match provided filters", async () => {
        // Create user and past event
        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            eventPayload: { date: "2000-01-01" }
        });

        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        // Get all events with ridiculous filters
        const { res: getAllRes } = await getAllEvents(agent, {
            sourceFilter: "student",
            dateFilter: "3000-01-01"
        });

        expect(getAllRes.status).toBe(200);
        expect(getAllRes.body).toEqual([]); // No events should match filters
    });

    it("returns 200 with only events matching `sourceFilter`", async () => {
        // Create user and event
        const { userRes, eventRes } = await createTestUserAndEvent(agent, {
            eventPayload: { date: "2077-05-01" }
        });

        expect(userRes.status).toBe(200);
        expect(eventRes.status).toBe(201);

        const eventId = eventRes.body.eventId;

        // Get all events with source filter
        const { res: getAllRes } = await getAllEvents(agent, {
            sourceFilter: "student"
        });

        expect(getAllRes.status).toBe(200);

        const createdEvent = getAllRes.body.find(e => e.id === eventId);
        expect(createdEvent).toBeDefined();

        expect(getAllRes.body.every(e => e.source === "student")).toBe(true); // All events should match source filter
    });

    it("returns 200 with only events matching `dateFilter`", async () => {
        // Create user and events with different dates
        await registerAndLoginTestUser(agent);

        const { res: createMatchingRes } = await createTestEvent(agent, { date: "2077-05-01" });
        expect(createMatchingRes.status).toBe(201);

        const { res: createNonMatchingRes } = await createTestEvent(agent, { date: "2077-05-02" });
        expect(createNonMatchingRes.status).toBe(201);

        const matchingEventId = createMatchingRes.body.eventId;
        const nonMatchingEventId = createNonMatchingRes.body.eventId;

        // Get all events with date filter
        const { res: getAllRes } = await getAllEvents(agent, {
            dateFilter: "2077-05-01"
        });

        expect(getAllRes.status).toBe(200);

        const matchingEvent = getAllRes.body.find(e => e.id === matchingEventId);
        expect(matchingEvent).toBeDefined();

        const nonMatchingEvent = getAllRes.body.find(e => e.id === nonMatchingEventId);
        expect(nonMatchingEvent).toBeUndefined(); // Non-matching event should not be included
    });

    it("returns 200 with only events matching `search`", async () => {
        // Create user and events with different search fields
        await registerAndLoginTestUser(agent);
    
        const searchTerm = "asafdgasdfsdafg"; // No matches

        const { res: createMatchingRes } = await createTestEvent(agent, {
            description: `Search Match ${searchTerm}`
        });
        expect(createMatchingRes.status).toBe(201);

        const { res: createNonMatchingRes } = await createTestEvent(agent, {
            description: "Board Games Night"
        });
        expect(createNonMatchingRes.status).toBe(201);

        const matchingEventId = createMatchingRes.body.eventId;
        const nonMatchingEventId = createNonMatchingRes.body.eventId;

        // Get all events with search filter
        const { res: getAllRes } = await getAllEvents(agent, {
            search: searchTerm
        });

        expect(getAllRes.status).toBe(200);

        const matchingEvent = getAllRes.body.find(e => e.id === matchingEventId);
        expect(matchingEvent).toBeDefined();

        const nonMatchingEvent = getAllRes.body.find(e => e.id === nonMatchingEventId);
        expect(nonMatchingEvent).toBeUndefined(); // Non-matching event should not be included
    });
});