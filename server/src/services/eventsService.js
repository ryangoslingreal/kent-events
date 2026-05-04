const eventsRepo = require('../repos/eventsRepo');

/**
 * Creates a new event.
 * 
 * @param {number} userId - ID of the user creating the event
 * @param {string} title - Event title
 * @param {string} description - Event description
 * @param {Object|null} image - Optional uploaded image file
 * @param {string} date - Event date
 * @param {string} start_time - Event start time
 * @param {string} end_time - Event end time
 * @param {string} location - Event location
 * @param {string|string[]} tags - Event tags
 * @param {string} ticket_url - Optional ticket URL
 * @param {string} contact_email - Optional contact email
 * 
 * @returns {Promise<Object>} Database insert result
 */
async function createEvent(
    userId, title, description,
    image, date, start_time, end_time,
    location, tags, ticket_url, contact_email
) {
    return await eventsRepo.createEvent(
        userId,
        title,
        description,
        image,
        date,
        start_time,
        end_time,
        location,
        toTagArray(tags),
        ticket_url,
        contact_email
    );
}

/**
 * Updates an event if it exists and is owned by the requesting user.
 * 
 * @param {number|string} eventId - Event ID
 * @param {number} userId - ID of the requesting user
 * @param {string} title - Event title
 * @param {string} description - Event description
 * @param {Object|null|undefined} image - Uploaded image, null to clear, or undefined to preserve existing image
 * @param {string} date - Event date
 * @param {string} start_time - Event start time
 * @param {string} end_time - Event end time
 * @param {string} location - Event location
 * @param {string|string[]} tags - Event tags
 * @param {string} ticket_url - Optional ticket URL
 * @param {string} contact_email - Optional contact email
 * 
 * @returns {Promise<Object>} Result object containing update status and updated event
 * 
 * @status EVENTNOTFOUND - Event does not exist
 * @status FORBIDDEN - User does not own the event
 * @status UPDATED - Event updated successfully
 */
async function updateEvent(
    eventId, userId, title, description, image,
    date, start_time, end_time,
    location, tags, ticket_url, contact_email
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
        description,
        image,
        date,
        start_time,
        end_time,
        location,
        toTagArray(tags),
        ticket_url,
        contact_email
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
 * @param {string} opts.mode - Retrieval mode, either "api" or "image"
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
 * @param {string} sourceFilter - Source filter
 * @param {string|null} dateFilter - Optional date filter
 * 
 * @returns {Promise<Object[]>} Array of formatted event DTOs
 */
async function getAllEvents(limit, offset, sourceFilter, dateFilter, search) {
    const sourceMap = {
        "society": ["ksu", "society"],
        "university": "kentUni",
        "student": "student",
        "all": null
    };

    const rows = await eventsRepo.getAllEvents(
        limit,
        offset,
        sourceMap[sourceFilter] ?? null,
        dateFilter ?? null,
        search ?? null
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
        description: event.description,
        date: event.date,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        tags: event.tags,
        contact_email: event.contact_email,
        ticket_url: event.ticket_url,
        source: event.source,
        image: {
            url: imageUrl,
            kind: imageKind
        },
        backgroundImageUrl: event.background_image_url ?? null,
        updated_at: event.updated_at
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
    updateEvent,
    deleteEvent,
    getEvent,
    getAllEvents,
    getUserMadeEvents
};