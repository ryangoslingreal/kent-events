import { beforeEach, describe, it, expect, afterEach } from "vitest";
const inbox = require("../helpers/emailInbox.js");
const { createTestAgent } = require("../helpers/testingUtils.js");
const { cleanupTestUsers, cleanupTestEvents } = require("../helpers/dbTestingUtils.js");
const { makeTestEmail, registerAndLoginTestUser, logoutTestUser } = require("../helpers/authTestingUtils.js");
const { createTestEvent, getUserMadeEvents } = require("../helpers/eventsTestingUtils.js");

const TEST_PREFIX = process.env.TEST_PREFIX;

describe.sequential("api/events/get-user-made-events", () => {
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

    it("returns 200 with array of events for authenticated user", async () => {
        // Create event as User 1
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const user1Titles = [
            `${TEST_PREFIX} User 1's Event 1`, 
            `${TEST_PREFIX} User 1's Event 2`
        ];

        for (const title of user1Titles) {
            const { res: createRes } = await createTestEvent(agent, { title });
            expect(createRes.status).toBe(201);
        }

        // Get User 1's events and verify
        const { res: listRes1 } = await getUserMadeEvents(agent);
        expect(listRes1.status).toBe(200);
        expect(listRes1.body).toBeInstanceOf(Array);
        expect(listRes1.body).toHaveLength(user1Titles.length);

        for (const event of listRes1.body) {
            expect(user1Titles).toContain(event.title);
        }

        // Logout User 1 and create event as User 2
        await logoutTestUser(agent);
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const user2Titles = [
            `${TEST_PREFIX} User 2's Event 1`, 
            `${TEST_PREFIX} User 2's Event 2`
        ];

        for (const title of user2Titles) {
            const { res: createRes } = await createTestEvent(agent, { title });
            expect(createRes.status).toBe(201);
        }

        // Get User 2's events and verify only User 2's events are returned
        const { res: listRes2 } = await getUserMadeEvents(agent);
        expect(listRes2.status).toBe(200);
        expect(listRes2.body).toBeInstanceOf(Array);
        expect(listRes2.body).toHaveLength(user2Titles.length);

        for (const event of listRes2.body) {
            expect(user2Titles).toContain(event.title);
            expect(user1Titles).not.toContain(event.title);
        }
    });

    it("returns 200 with empty array if user has no events", async () => {
        await registerAndLoginTestUser(agent, makeTestEmail(), "testpassword");

        const { res: listRes } = await getUserMadeEvents(agent);
        expect(listRes.status).toBe(200);
        expect(listRes.body).toEqual([]);
    });

    it("returns 401 when user is not authenticated", async () => {
        const { res: listRes } = await getUserMadeEvents(agent);
        expect(listRes.status).toBe(401);
    });
});