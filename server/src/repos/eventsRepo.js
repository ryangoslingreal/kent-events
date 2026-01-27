const db = require('../db/pool');

async function createEvent(title, subtitle, description, date, time, location, tags, price, repeat, contactInfo){
    
    const query = 'INSERT INTO events (title, user_id ,subtitle, description, event_date, event_time, location, tags, price, repeat_event, available_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [title, 1 ,subtitle, description, date, time, location, JSON.stringify(tags), price, repeat, contactInfo];

    await db.query(query, values);

}


module.exports = { 
    createEvent
};