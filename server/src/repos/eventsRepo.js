const db = require('../db/pool');

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
 * @param {string[]} tags - Event tags
 * @param {string|number} price - Event price
 * @param {number} availableContact - Whether contact is available, stored as 1 or 0
 * @param {string} source - Event source, defaults to "student"
 * 
 * @returns {Promise<Object>} Database insert result
 */
async function createEvent(
    userId, title, description, image,
    date, start_time, end_time,
    location, tags, price, availableContact,
    source = "student"
) {
    const query = `
        INSERT INTO events (
            user_id, title, description, image, image_mime,
            date, start_time, end_time,
            location, tags, price, available_contact, source
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        userId, title, description, image?.buffer ?? null, image?.mimetype ?? null,
        date, start_time, end_time,
        location, JSON.stringify(tags), price, availableContact, source
    ];

    const [result] = await db.query(query, values);
    return result;
}

/**
 * Updates an existing event by ID.
 * Preserves, clears, or replaces the uploaded image depending on the image value
 * 
 * @param {string|number} eventId - Event ID
 * @param {string} title - Event title
 * @param {string} description - Event description
 * @param {Object|null|undefined} image - Uploaded image file, null to clear, or undefined to preserve existing image
 * @param {string} date - Event date
 * @param {string} start_time - Event start time
 * @param {string} end_time - Event end time
 * @param {string} location - Event location
 * @param {string[]} tags - Event tags
 * @param {string|number} price - Event price
 * @param {number} availableContact - Whether contact is available, stored as 1 or 0
 * 
 * @returns {Promise<Object>} Database update result
 */
async function updateEvent(
    eventId, title, description, image,
    date, start_time, end_time,
    location, tags, price, availableContact
) {
    // * NOTE:
    // * Currently overwrites all event fields, even if only a subset is being updated.
    // * This is simpler, but less efficient.

    // TODO: Consider updating only changed fields.

    const setClauses = [
        "title=?", "description=?",
        "date=?", "start_time=?", "end_time=?",
        "location=?", "tags=?", "price=?", "available_contact=?"
    ]

    const values = [
        title, description,
        date, start_time, end_time,
        location, JSON.stringify(tags ?? []), price, availableContact
    ];
    
    // image === undefined -> leave existing image unchanged
    // image === null -> clear image + mime
    // image is a file object -> replace image + mime
    if (image !== undefined) {
        setClauses.push("image=?", "image_mime=?");

        const imageData = image === null ? null : image.buffer;
        const imageMime = image === null ? null : image.mimetype;

        values.push(imageData, imageMime);
    }

    values.push(eventId);

    const query = `
        UPDATE events
        SET ${setClauses.join(", ")}
        WHERE id = ?
    `;
        
    const [result] = await db.execute(query, values);
    return result;
}

/**
 * Deletes an event by ID.
 * 
 * @param {string|number} eventId - Event ID
 * 
 * @returns {Promise<Object>} Database delete result
 */
async function deleteEvent(eventId) {
    const query = `
        DELETE FROM events
        WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [eventId]);
    return result;
}

/**
 * Returns a single event by ID.
 * In image mode, only returns image fields needed to serve the image response.
 * 
 * @param {string|number} eventId - Event ID
 * @param {Object} opts - Optional retrieval options
 * @param {string} opts.mode - Retrieval mode, either "api" or "image"
 * 
 * @returns {Promise<Object|null>} Event row, or null if not found
 */
async function getEvent(eventId, { mode = "api" } = {}) {
    let query;

    if (mode === "image") {
        query = `
            SELECT id, image, image_mime
            FROM events
            WHERE id = ?
            LIMIT 1
        `;
    } else {
        query = `
            SELECT
                id, user_id, title, description,
                date, start_time, end_time,
                location, tags, price, available_contact, source,
                image_url, background_image_url, ticket_url,
                updated_at,
                CASE WHEN image IS NOT NULL THEN 1 ELSE 0 END AS has_uploaded_image
            FROM events
            WHERE id = ?
            LIMIT 1
        `;
    }

    const [rows] = await db.execute(query, [eventId]);
    const row = rows[0] ?? null;
    if (!row) return null;

    return {
        ...row,
        tags: parseTags(row.tags)
    };
}

/**
 * Returns paginated upcoming events, optionally filtered by source and date.
 * 
 * @param {number} limit - Maximum number of events to return
 * @param {number} offset - Number of events to skip
 * @param {string|null} sourceFilter - Optional source filter
 * @param {string|null} dateFilter - Optional date filter
 * 
 * @returns {Promise<Object[]>} Array of event rows
 */
async function getAllEvents(limit, offset, sourceFilter, dateFilter) {
    let query = `
        SELECT
            id, title, description,
            date, start_time, end_time,
            location, tags, price, available_contact, source,
            image_url, background_image_url, ticket_url,
            updated_at,
            CASE WHEN image IS NOT NULL THEN 1 ELSE 0 END AS has_uploaded_image
        FROM events
        WHERE date >= CURDATE()
    `;

    const params = [];

    if (dateFilter){
        query += ` AND DATE(date) = DATE(?)`;
        params.push(dateFilter);
    }
    
    if (sourceFilter != null){
        query += ` AND source = ?`;
        params.push(sourceFilter);
    }

    query += `
        ORDER BY date ASC, start_time ASC 
        LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows.map(row => ({
        ...row,
        tags: parseTags(row.tags)
    }));
}

/**
 * Returns basic event details for events created by a specific user.
 * 
 * @param {number} user_id - User ID whose events should be returned
 * 
 * @returns {Promise<Object[]>} Array of event summary rows
 */
async function getUserMadeEvents(user_id) {
    const query = `
        SELECT id, title, date
        FROM events
        WHERE user_id = ?
    `;    

    const [rows] = await db.execute(query, [user_id]);
    return rows;
}

/**
 * Saves scraped KSU or university events.
 * Existing events are ignored using the external URL uniqueness constraint.
 * 
 * @param {Object[]} events - Scraped event objects to save
 * 
 * @returns {Promise<void>}
 */
async function saveKSUEvents(events) {
    const query = `
        INSERT INTO events (
            title, user_id, description,
            date, start_time, end_time,
            location, tags, price, available_contact,
            image_url, background_image_url, source, external_url,
            ticket_url
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE external_url = external_url
    `;

    for (const event of events) {
        if (!event.title) {
            continue; 
        }
        
        const values = [
            event.title,
            1, // Default user_id = 1
            event.description || "No description provided",
            event.date,
            event.time,
            event.end_event_time,
            event.location,
            JSON.stringify(event.tags),
            0, // price
            0, // available_contact
            event.image_url,
            event.background_event_image_url,
            event.source,
            event.external_url,
            event.ticket_url
        ];

        await db.query(query, values);
    }
}

/**
 * Returns the latest scrape update time for scraped KSU or university events.
 * 
 * @returns {Promise<Object[]>} Array containing the latest updated_at row
 */
async function lastScrapeTime(){
    const query = `
        SELECT updated_at
        FROM events
        WHERE source IN ("ksu", "kentUni")
        ORDER BY updated_at DESC
        LIMIT 1
    `;

    const [result] = await db.execute(query);
    return result;
}

/**
 * Parses raw database tags into an array.
 * Accepts arrays, JSON arrays, single strings, or null.
 * 
 * @param {*} value - Raw tag value
 * 
 * @returns {Array} Normalised array of non-empty tag values
 */
function parseTags(raw) {
    if (Array.isArray(raw)) {
        return raw;
    }

    if (raw == null || raw === "") {
        return [];
    }

    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
        return [];
    }
}

module.exports = { 
    createEvent,
    updateEvent,
    deleteEvent,
    getEvent,
    getAllEvents,
    getUserMadeEvents,
    saveKSUEvents,
    lastScrapeTime
};