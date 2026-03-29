const request = require("supertest");

const TEST_PREFIX = process.env.TEST_PREFIX;

function defaultEventPayload(overrides = {}) {
    return {
        title: `${TEST_PREFIX} Test Event`,
        subtitle: "Test Subtitle",
        description: "Test Description",
        image_mime: "image/png",
        event_date: "2077-05-01",
        event_time: "12:00",
        location: "Test Location",
        tags: "vitest",
        price: "0",
        repeat_event: "never",
        available_contact: "true",
        ...overrides
    }
}

async function sendMultipart(req, payload = {}, image = null) {
    Object.entries(payload).forEach(([k, v]) => {
        if (v === undefined || v === null) return;
        req.field(k, String(v));
    });

    if (image) {
        req.attach("image", image, {
            filename: "test.png",
            contentType: "image/png"
        });
    }

    const res = await req;
    return { res };
}

async function createTestEvent(agent, payload = {}, image = null) {
    return sendMultipart(
        agent
            .post("/api/events/create-event"), 
        defaultEventPayload(payload), 
        image
    );
}

async function updateTestEvent(agent, eventId, payload = {}, image = null) {
    return sendMultipart(
        agent
            .put("/api/events/update-event")
            .query({ eventId }),
        defaultEventPayload(payload),
        image
    );
}

async function deleteTestEvent(agent, eventId) {
    const res = await agent
        .delete("/api/events/delete-event")
        .query({ eventId });

    return { res };
}

async function getEvent(agent, eventId) {
    const res = await agent
        .get("/api/events/get-event")
        .query({ eventId });

    return { res };
}

async function getUserMadeEvents(agent) {
    const res = await agent
        .get("/api/events/get-user-made-events");

    return { res };
}

module.exports = {
    createTestEvent,
    updateTestEvent,
    deleteTestEvent,
    getEvent,
    getUserMadeEvents
}