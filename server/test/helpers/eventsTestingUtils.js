const request = require("supertest");

const TEST_PREFIX = process.env.TEST_PREFIX;

function defaultEventPayload(overrides = {}) {
    return {
        title: `${TEST_PREFIX} Test Event`,
        subtitle: "Test Subtitle",
        description: "Test Description",
        image_mime: "image/png",
        event_date: "2077-01-01",
        event_time: "11:35",
        location: "Canterbury",
        tags: "vitest",
        price: "0",
        repeat_event: "false",
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

async function createTestEvent(app, payload = {}, image = null) {
    return sendMultipart(
        request(app)
            .post("/api/events/create-event"), 
        defaultEventPayload(payload), 
        image
    );
}

async function updateTestEvent(app, eventId, payload = {}, image = null) {
    return sendMultipart(
        request(app)
            .put("/api/events/update-event")
            .query({ eventId }),
        defaultEventPayload(payload),
        image
    );
}

async function deleteTestEvent(app, eventId) {
    const res = await request(app)
        .delete("/api/events/delete-event")
        .query({ eventId });

    return { res };
}

async function getEvent(app, eventId) {
    const res = await request(app)
        .get("/api/events/get-event")
        .query({ eventId });

    return { res };
}

async function getUserMadeEvents(app) {
    const res = await request(app)
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