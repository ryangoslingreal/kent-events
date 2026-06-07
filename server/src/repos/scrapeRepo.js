const db = require('../db/pool');

/**
 * Saves scraped KSU or university events.
 * Existing events are ignored using the external URL uniqueness constraint.
 * 
 * @param {Object[]} events - Scraped event objects to save
 * @param {string} account - Account to assign the event to, either "kentUni" or "ksu"
 * 
 * @returns {Promise<void>}
 */
async function saveScrapedEvents(events, account) {
    const accountUserIds = {
        kentUni: 1,
        ksu: 2
    };

    const query = `
        INSERT INTO events (
            title, user_id, description,
            date, start_time, end_time,
            location, tags, ticket_url, contact_email,
            image_url, background_image_url, external_url
        ) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE external_url = external_url
    `;

    for (const event of events) {
        if (!event.title) {
            continue; 
        }
        
        const values = [
            event.title,
            accountUserIds[account] ?? null, // Null will fail
            event.description || "No description provided",
            event.date,
            event.time,
            event.end_event_time,
            event.location,
            JSON.stringify(event.tags),
            event.ticket_url,
            event.contact_email,
            event.image_url,
            event.background_event_image_url,
            event.external_url
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
        SELECT e.updated_at
        FROM events e
        JOIN users u ON e.user_id = u.id
        WHERE u.account_type IN ("ksu", "kentUni")
        ORDER BY e.updated_at DESC
        LIMIT 1
    `;

    const [result] = await db.execute(query);
    return result[0]?.updated_at ?? null;
}