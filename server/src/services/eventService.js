// This is the middle layer between 
// routes -> HTTP concerns, and
// repos -> database concerns
// This layer deals with all the logic to check before passing to the database, such as making sure events are in the future and not in the past

const eventsRepo = require('../repos/eventsRepo');

//Deals with passing a createEvent request to repos
async function createEvent(title, subtitle, description, image, date, time, location, tags, price, repeat, contactInfo, user_id) {
    try {
        const tagsParsed = toTagArray(tags);

        return await eventsRepo.createEvent(
            title,
            subtitle, description,
            image,
            date, time,
            location,
            tagsParsed,
            price,
            repeat,
            contactInfo,
            user_id
        );
    } catch (error) {
        throw error;
    }
}

async function getUserMadeEvents(event_id) {
    try {
        return await eventsRepo.getUserMadeEvents(event_id);
    } catch (error) {
        throw error;
    }
}

async function getEvent(eventId) {
    try {
        return await eventsRepo.getEvent(eventId);
    } catch (error) {
        throw error;
    }
}

async function deleteEvent(eventId, userId) {
    let event;
    try {
        event = await eventsRepo.getEvent(eventId);
    } catch (error){
        throw error;
    }

    if (!event) {
        return { status: "EVENTNOTFOUND" };
    }

    if (event.user_id !== userId) { // Check if the user owns the event
        return { status: "FORBIDDEN" };
    }

    try {
        await eventsRepo.deleteEvent(eventId);
    } catch (error) {
        throw error;
    }

    return { status: "DELETED", message: "Event deleted" };
}

async function updateEvent(eventId, userId, title, subtitle, description, image, event_date, event_time, location, tags, price, repeat_event, available_contact) {
    let event;
    try {
        event = await eventsRepo.getEvent(eventId);
    } catch (error){
        throw error;
    }

    if (!event) {
        return { status: "EVENTNOTFOUND" };
    }

    if (event.user_id !== userId) { // Check if the user owns the event
        return { status: "FORBIDDEN" };
    }

    try {
        const tagsParsed = toTagArray(tags);

        await eventsRepo.updateEvent(
            eventId, title,
            subtitle, description,
            image,
            event_date, event_time,
            location,
            tagsParsed,
            price,
            repeat_event,
            available_contact
        );
    } catch (error) {
        throw error;
    }

    return { status: "UPDATED", message: "Event updated" };
}

async function getAllEvents(limit, offset, sourceFilter, dateFilter) {
    const sourceMap = {
        "society": "ksu",
        "university": "kentUni",
        "student": "student",
        "all": null
    };
    
    return await eventsRepo.getAllEvents(
        limit,
        offset,
        sourceMap[sourceFilter] ?? null,
        dateFilter ?? null
    );
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