//this file basically deals with writing SQL calls to the database using the data passed from services

const db = require('../db/pool');

async function createEvent(title, subtitle, description, image, date, time, location, tags, price, repeat, contactInfo, user_id, source = "student") {
    const query = 'INSERT INTO events (title, user_id ,subtitle, description, image, image_mime, event_date, event_time, location, tags, price, repeat_event, available_contact, source) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [
        title,
        user_id,
        subtitle,
        description,
        image?.buffer ?? null,
        image?.mimetype ?? null,
        date,
        time,
        location,
        JSON.stringify(tags),
        price,
        repeat,
        contactInfo,
        source
    ];

    const [result] = await db.query(query, values);
    return result;
}

async function saveKSUEvents(events) {
    for (const event of events){
        if (!event.title || !event.description) {
            continue; 
        }
        const query = `INSERT INTO events (title, user_id, description, event_date, event_time, location, tags, price, repeat_event, available_contact, image_url, background_event_image_url, source, external_url, end_event_time, ticket_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE external_url = external_url`;
        const values = [event.title, 1, event.description, event.date, event.time, event.location, JSON.stringify(event.tags), 0, "never", 0, event.image_url, event.background_event_image_url, event.source, event.external_url, event.end_event_time, event.ticket_url]   //Made the user_id 1 as default
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

async function getEvent(eventId) {
    const query = `
        SELECT *
        FROM events
        WHERE id = ?
        LIMIT 1
    `;

    const [rows] = await db.execute(query, [eventId]);
    const row = rows[0] ?? null;

    if (!row) {
        return null;
    }

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

async function updateEvent(eventId, title, subtitle, description, image, event_date, event_time, location, tags, price, repeat_event, available_contact) {
    // * NOTE:
    // * Currently overwrites all event fields, even if only a subset is being updated.
    // * This is simpler, but less efficient.

    // TODO: Consider updating only changed fields.
    
    // image === undefined -> leave existing image unchanged
    if (image === undefined) {
        const query = `
            UPDATE events
            SET title=?, subtitle=?, description=?, event_date=?, event_time=?, location=?, tags=?, price=?, repeat_event=?, available_contact=?
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [title, subtitle, description, event_date, event_time, location, JSON.stringify(tags), price, repeat_event, available_contact, eventId]);
        return result;
    }

    // image === null -> clear image and mime
    // image is a file object -> replace image
    const query = `
        UPDATE events
        SET title=?, subtitle=?, description=?, image=?, image_mime=?, event_date=?, event_time=?, location=?, tags=?, price=?, repeat_event=?, available_contact=?
        WHERE id = ?
    `;

    const imageData = image === null ? null : image.buffer;
    const imageMime = image === null ? null : image.mimetype;
        
    const [result] = await db.execute(query, [title, subtitle, description, imageData, imageMime, event_date, event_time, location, JSON.stringify(tags ?? []), price, repeat_event, available_contact, eventId]);
    return result;
}

async function getAllEvents(limit, offset, sourceFilter, dateFilter) {
    let query = `
        SELECT id, title, subtitle, description, image_url, image_mime, event_date, event_time, location, tags, price, repeat_event, available_contact, source
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
        tags: parseTags(rows.tags)
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