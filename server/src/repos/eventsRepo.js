const db = require('../db/pool');

async function createEvent(
    title, subtitle, description, image,
    eventDate, eventTime, location, tags, price, repeatEvent,
    availableContact, user_id, source = "student"
) {
    const query = `
        INSERT INTO events (
            title, user_id, subtitle, description, image, image_mime,
            event_date, event_time, location, tags, price, repeat_event,
            available_contact, source
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        title, user_id, subtitle, description,
        image?.buffer ?? null, image?.mimetype ?? null,
        eventDate, eventTime, location, JSON.stringify(tags),
        price, repeatEvent, availableContact, source
    ];

    const [result] = await db.query(query, values);
    return result;
}

async function saveKSUEvents(events) {
    const query = `
        INSERT INTO events (
            title, user_id, description, event_date, event_time,
            location, tags, price, repeat_event, available_contact,
            image_url, background_image_url, source, external_url,
            end_event_time, ticket_url
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            event.location,
            JSON.stringify(event.tags),
            0,
            "never",
            0,
            event.image_url,
            event.background_event_image_url,
            event.source,
            event.external_url,
            event.end_event_time,
            event.ticket_url
        ];

        await db.query(query, values);
    }
}

async function getUserMadeEvents(user_id) {
    const query = `
        SELECT id, title, event_date
        FROM events
        WHERE user_id = ?
    `;    

    const [rows] = await db.execute(query, [user_id]);
    return rows;
}

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
                id, user_id, title, subtitle, description,
                event_date, event_time, location, tags,
                price, repeat_event, available_contact,
                source, image_url, background_image_url,
                updated_at, ticket_url, 
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

async function deleteEvent(eventId) {
    const query = `
        DELETE FROM events
        WHERE id = ?
    `;
    
    const [result] = await db.execute(query, [eventId]);
    return result;
}

async function updateEvent(
    eventId, title, subtitle, description, image,
    eventDate, eventTime, location, tags, price,
    repeatEvent, availableContact
) {
    // * NOTE:
    // * Currently overwrites all event fields, even if only a subset is being updated.
    // * This is simpler, but less efficient.

    // TODO: Consider updating only changed fields.

    const setClauses = [
        "title=?", "subtitle=?", "description=?", "event_date=?", "event_time=?",
        "location=?", "tags=?", "price=?", "repeat_event=?", "available_contact=?"
    ]

    const values = [
        title, subtitle, description, eventDate, eventTime, location,
        JSON.stringify(tags ?? []), price, repeatEvent, availableContact
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

async function getAllEvents(limit, offset, sourceFilter, dateFilter) {
    let query = `
        SELECT
            id, title, subtitle, description,
            event_date, event_time, location, tags,
            price, repeat_event, available_contact, source,
            image_url, background_image_url, updated_at, ticket_url,
            CASE WHEN image IS NOT NULL THEN 1 ELSE 0 END AS has_uploaded_image
        FROM events
        WHERE event_date >= CURDATE()
    `;

    const params = [];

    if (dateFilter){
        query += ` AND DATE(event_date) = DATE(?)`;
        params.push(dateFilter);
    }
    
    if (sourceFilter != null){
        query += ` AND source = ?`;
        params.push(sourceFilter);
    }

    query += `
        ORDER BY event_date ASC, event_time ASC 
        LIMIT ? OFFSET ?
    `;

    params.push(limit, offset);

    const [rows] = await db.query(query, params);
    return rows.map(row => ({
        ...row,
        tags: parseTags(row.tags)
    }));
}

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
    getUserMadeEvents,
    getEvent,
    deleteEvent,
    updateEvent,
    getAllEvents,
    saveKSUEvents,
    lastScrapeTime
};