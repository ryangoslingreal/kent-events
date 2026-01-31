//this file basically deals with writing SQL calls to the database using the data passed from services

const db = require('../db/pool');

async function createEvent(title, subtitle, description, image,  date, time, location, tags, price, repeat, contactInfo){
    
    const query = 'INSERT INTO events (title, user_id ,subtitle, description, image, event_date, event_time, location, tags, price, repeat_event, available_contact) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [title, 1 ,subtitle, description, image?.buffer ?? null, date, time, location, JSON.stringify(tags), price, repeat, contactInfo]; //user_id needs to be changed

    await db.query(query, values);

}

async function getUserMadeEvents(){
    const user_id = 1;  //change to user signed in
    const query = `
                    SELECT id, title, event_date
                    FROM events
                    WHERE user_id = ?
                `;    

        const [rows] = await db.query(query, user_id);     //[rows] returns the data as a list here, which stops the output of metadata
        return rows;
}


module.exports = { 
    createEvent,
    getUserMadeEvents

};