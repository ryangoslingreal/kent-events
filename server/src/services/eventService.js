const eventsRepo = require('../repos/eventsRepo');

/**
 * Creates a new event.
 * 
 * @param {string} title - Event title
 * @param {string} subtitle - Optional event subtitle
 * @param {string} description - Event description
 * @param {Object|null} image - Optional uploaded image file
 * @param {string} date - Event date
 * @param {string} time - Event time
 * @param {string} location - Event location
 * @param {string|string[]} tags - Event tags
 * @param {string|number} price - Event price
 * @param {string} repeat - Repeat event setting
 * @param {number} contactInfo - Whether contact is available, stored as 1 or 0
 * @param {number} user_id - ID of the user creating the event
 * 
 * @returns {Promise<Object>} Database insert result
 */
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

/**
 * Updates an event if it exists and is owned by the requesting user.
 * 
 * @param {number|string} eventId - Event ID
 * @param {number} userId - ID of the requesting user
 * @param {string} title - Event title
 * @param {string} subtitle - Optional event subtitle
 * @param {string} description - Event description
 * @param {Object|null|undefined} image - Uploaded image, null to clear, or undefined to preserve existing image
 * @param {string} event_date - Event date
 * @param {string} event_time - Event time
 * @param {string} location - Event location
 * @param {string|string[]} tags - Event tags
 * @param {string|number} price - Event price
 * @param {string} repeat_event - Repeat event setting
 * @param {number} available_contact - Whether contact is available, stored as 1 or 0
 * 
 * @returns {Promise<Object>} Result object containing update status and updated event
 * 
 * @status EVENTNOTFOUND - Event does not exist
 * @status FORBIDDEN - User does not own the event
 * @status UPDATED - Event updated successfully
 */
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

/**
 * Deletes an event if it exists and is owned by the requesting user.
 * 
 * @param {number|string} eventId - Event ID
 * @param {number} userId - ID of the requesting user
 * 
 * @returns {Promise<Object>} Result object containing deletion status
 * 
 * @status EVENTNOTFOUND - Event does not exist
 * @status FORBIDDEN - User does not own the event
 * @status DELETED - Event deleted successfully
 */
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

/**
 * Returns a single event by ID.
 * 
 * @param {number|string} eventId - Event ID
 * @param {Object} opts - Optional retrieval options
 * @param {string} opts.mode - Retrieval mode, such as "image"
 * 
 * @returns {Promise<Object|null>} Formatted event DTO, raw image row, or null
 */
async function getEvent(eventId, opts) {
    const row = await eventsRepo.getEvent(eventId, opts);
    if (!row) return null;

    if (opts?.mode === "image") {
        return row;
    }

    return toEventDTO(row);
}

/**
 * Returns a paginated list of events, optionally filtered by source and date.
 * 
 * @param {number} limit - Maximum number of events to return
 * @param {number} offset - Number of events to skip
 * @param {string} sourceFilter - Source filter from the client
 * @param {string} dateFilter - Optional event date filter
 * 
 * @returns {Promise<Object[]>} Array of formatted event DTOs
 */
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

/**
 * Returns all events created by a specific user.
 * 
 * @param {number} userId - User ID whose events should be returned
 * 
 * @returns {Promise<Object[]} Array of event rows
 */
async function getUserMadeEvents(userId) {
    return await eventsRepo.getUserMadeEvents(userId);
}

/**
 * Converts an event database row into an event DTO returned to the client.
 * Normalises uploaded and remote image fields into a single image object.
 * 
 * @param {Object} event - Raw event row from the database
 * 
 * @returns {Object} Formatted event DTO
 */
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
        updated_at: event.updated_at,
        ticket_url: event.ticket_url,
        end_event_time: event.end_event_time
    };
}

/**
 * Normalises tag input into an array.
 * Accepts arrays, JSON arrays, single strings, or null.
 * 
 * @param {*} value - Raw tag input
 * 
 * @returns {Array} Normalised array of non-empty tag values
 */
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