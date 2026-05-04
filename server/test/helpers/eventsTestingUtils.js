const TEST_PREFIX = process.env.TEST_PREFIX;

function defaultEventPayload(overrides = {}) {
    return {
        title: `${TEST_PREFIX} Test Event`,
        description: "Test Description",
        date: "2077-05-01",
        start_time: "12:00",
        end_time: "17:00",
        location: "Test Location",
        tags: ["vitest"],
        ticket_url: "https://www.example.com",
        contact_email: "testemail@example.com",
        ...overrides
    }
}

async function sendMultipart(req, payload = {}, image = null) {
    Object.entries(payload).forEach(([k, v]) => {
        if (v === undefined || v === null) return;

        if (Array.isArray(v)) {
            v.forEach(item => req.field(k, String(item)));
            return;
        }
        
        req.field(k, String(v));
    });

    if (image != null) {
        req.attach("image", image, {
            filename: "test.png",
            contentType: "image/png"
        });
    }

    const res = await req;
    return { res };
}

function normaliseEvent(event) {
    return {
        ...event,
        date: event.date?.slice(0, 10) ?? null,
        start_time: event.start_time?.slice(0, 5) ?? null,
        end_time: event.end_time?.slice(0, 5) ?? null,
        tags: typeof event.tags === "string" ? JSON.parse(event.tags) : event.tags
    };
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

async function getAllEvents(
    agent,
    {
        limit = 100000,
        offset = 0,
        sourceFilter,
        dateFilter,
        search
    } = {}) {
    const req = agent
        .get("/api/events/get-all-events");

    if (limit !== undefined) req.query({ limit });
    if (offset !== undefined) req.query({ offset });
    if (sourceFilter !== undefined) req.query({ sourceFilter });
    if (dateFilter !== undefined) req.query({ dateFilter });
    if (search !== undefined) req.query({ search });

    const res = await req;

    return { res };
}

async function getEventImage(agent, eventId) {
    const res = await agent
        .get(`/api/events/${eventId}/image`);

    return { res };
}

module.exports = {
    normaliseEvent,
    createTestEvent,
    updateTestEvent,
    deleteTestEvent,
    getEvent,
    getUserMadeEvents,
    getAllEvents,
    getEventImage
}