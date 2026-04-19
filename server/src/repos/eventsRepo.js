//this file basically deals with writing SQL calls to the database using the data passed from services

const db = require('../db/pool');

async function createEvent(title, subtitle, description, image, image_mime, date, time, location, tags, price, repeat, contactInfo, user_id) {
    const query = 'INSERT INTO events (title, user_id ,subtitle, description, image, image_mime, event_date, event_time, location, tags, price, repeat_event, available_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [title, user_id ,subtitle, description, image?.buffer ?? null, image_mime, date, time, location, JSON.stringify(tags), price, repeat, contactInfo];

    const [result] = await db.query(query, values);
    return result;
}

async function saveKSUEvents(events) {
    for (const event of events){
        if (!event.title || !event.description) {
            continue; 
        }
        const query = `INSERT INTO events (title, user_id, description, image, image_mime, event_date, event_time, location, tags, price, repeat_event, available_contact, image_url, background_event_image_url, source, external_url, end_event_time, ticket_url) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE external_url = external_url`;
        const values = [event.title, 1, event.description, null, null, event.date, event.time, event.location, JSON.stringify(event.tags), 0, "never", 0, event.image_url, event.background_event_image_url, event.source, event.external_url, event.end_event_time, event.ticket_url]   //Made the user_id 1 as default
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
    `;

    const [rows] = await db.execute(query, [eventId]);
    return rows ?? null;
}

async function deleteEvent(eventId) {
    const query = `
        DELETE 
        FROM events
        WHERE id = ?
    `;

    const [result] = await db.execute(query, [eventId]);
    return result;
}

async function updateEvent(eventId, title, subtitle, description, image, image_mime, event_date, event_time, location, tags, price, repeat_event, available_contact) {
    // Checks for image, to save executing time
    if (!image) {
        const query = `
            UPDATE events
            SET title=?, subtitle=?, description=?, event_date=?, event_time=?, location=?, tags=?, price=?, repeat_event=?, available_contact=?
            WHERE id = ?
        `;

        const [result] = await db.execute(query, [title, subtitle, description, event_date, event_time, location, JSON.stringify(tags), price, repeat_event, available_contact, eventId]);
        return result;
    }

    const query = `
        UPDATE events
        SET title=?, subtitle=?, description=?, image=?, image_mime=?, event_date=?, event_time=?, location=?, tags=?, price=?, repeat_event=?, available_contact=?
        WHERE id = ?
    `;
        
    const [result] = await db.execute(query, [title, subtitle, description, image?.buffer, image_mime, event_date, event_time, location, JSON.stringify(tags), price, repeat_event, available_contact, eventId]);
    return result;

    // ? SHOULD i JUST UPDATE ALL COLUMNS with teh sepcific event, or only changed ones?
}

async function getAllEvents(limit, offset){
    const query = `
                    SELECT *
                    FROM events
                    WHERE event_date >= CURDATE()
                    LIMIT ? OFFSET ?
    `
    const [rows] = await db.query(query, [limit, offset]);
    return rows;
}

async function lastScrapeTime(){
    const query = `
        SELECT updated_at
        FROM events
        WHERE source = 'ksu' OR source = 'kentUni'
        LIMIT 1
    `
    const [result] = await db.execute(query)
    return result
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