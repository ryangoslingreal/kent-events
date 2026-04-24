const eventsRepo = require('../repos/eventsRepo');

async function createEvent(
    title, subtitle, description,
    image, date, time, location,
    tags, price, repeat, contactInfo,
    user_id
) {
    return await eventsRepo.createEvent(
        title,
        subtitle,
        description,
        image,
        date,
        time,
        location,
        toTagArray(tags),
        price,
        repeat,
        contactInfo,
        user_id
    );
}

async function getUserMadeEvents(event_id) {
    return await eventsRepo.getUserMadeEvents(event_id);
}

async function getEvent(eventId, opts) {
    const row = await eventsRepo.getEvent(eventId, opts);
    if (!row) return null;

    if (opts?.mode === "image") {
        return row;
    }

    return toEventDTO(row);
}

async function deleteEvent(eventId, userId) {
    const event = await eventsRepo.getEvent(eventId);

    if (!event) {
        return { status: "EVENTNOTFOUND" };
    }

    if (event.user_id !== userId) { // Check if the user owns the event
        return { status: "FORBIDDEN" };
    }

    await eventsRepo.deleteEvent(eventId);

    return { status: "DELETED", message: "Event deleted" };
}

async function updateEvent(
    eventId, userId, title, subtitle, description,
    image, event_date, event_time, location, tags,
    price, repeat_event, available_contact
) {
    const event = await eventsRepo.getEvent(eventId);

    if (!event) {
        return { status: "EVENTNOTFOUND" };
    }

    if (event.user_id !== userId) { // Check if the user owns the event
        return { status: "FORBIDDEN" };
    }

    await eventsRepo.updateEvent(
        eventId,
        title,
        subtitle,
        description,
        image,
        event_date,
        event_time,
        location,
        toTagArray(tags),
        price,
        repeat_event,
        available_contact
    );

    return {
        status: "UPDATED",
        message: "Event updated",
        event: await getEvent(eventId)
    };
}

async function getAllEvents(limit, offset, sourceFilter, dateFilter) {
    const sourceMap = {
        "society": "ksu",
        "university": "kentUni",
        "student": "student",
        "all": null
    };
    const rows = await eventsRepo.getAllEvents(
        limit,
        offset,
        sourceMap[sourceFilter] ?? null,
        dateFilter ?? null
    );

    return rows.map(toEventDTO);
}

function toEventDTO(event) {
    const hasUploadedImage = Boolean(event.has_uploaded_image);

    let imageUrl = null;
    let imageKind = "none";

    if (hasUploadedImage) {
        imageUrl = `/api/events/${event.id}/image?v=${new Date(event.updated_at).getTime()}`;
        imageKind = "upload";
    } else if (event.image_url) {
        imageUrl = event.image_url;
        imageKind = "remote";
    }

    return {
        id: event.id,
        title: event.title,
        subtitle: event.subtitle,
        description: event.description,
        event_date: event.event_date,
        event_time: event.event_time,
        end_event_time: event.end_event_time ?? null,
        location: event.location,
        tags: event.tags,
        price: event.price,
        repeat_event: event.repeat_event,
        available_contact: event.available_contact,
        source: event.source,
        image: {
            url: imageUrl,
            kind: imageKind
        },
        backgroundImageUrl: event.background_image_url ?? null,
        updated_at: event.updated_at
    };
}

function toTagArray(value) {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }

    if (value == null || value === "") {
        return [];
    }

    if (typeof value === "string") {
        try {
            const parsed = JSON.parse(value);
            return Array.isArray(parsed) ? parsed.filter(Boolean) : [parsed].filter(Boolean);
        } catch {
            return [value].filter(Boolean);
        }
    }

    return [value].filter(Boolean);
}

module.exports = { 
    createEvent,
    getUserMadeEvents,
    getEvent,
    deleteEvent,
    updateEvent,
    getAllEvents
};