// This is the middle layer between 
// routes -> HTTP concerns, and
// repos -> database concerns
// This layer deals with all the logic to check before passing to the database, such as making sure events are in the future and not in the past

const eventsRepo = require('../repos/eventsRepo');

//Deals with passing a createEvent request to repos
async function createEvent(title, subtitle, description, image, image_mime, date, time, location, tag, price, repeat, contactInfo, user_id) {
    try {
        return await eventsRepo.createEvent(
            title, 
            subtitle, description, 
            image, image_mime, 
            date, time, 
            location, 
            tag, 
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

async function deleteEvent(eventId) {
    let result;
    try {
        result = await eventsRepo.deleteEvent(eventId);
    } catch (error){
        throw error;
    }

    if (result.affectedRows === 0) {
        return { status:"EVENTNOTFOUND" };
    }

    return { message: "Event deleted" };
}

async function updateEvent(eventId, title, subtitle, description, image, image_mime, event_date, event_time, location, tag, price, repeat_event, available_contact) {
    let result;
    try {
        result = await eventsRepo.updateEvent(
            eventId, title, 
            subtitle, description, 
            image, image_mime, 
            event_date, event_time, 
            location, 
            tag, 
            price, 
            repeat_event, 
            available_contact
        );
    } catch (error) {
        throw error;
    }

    if (result.affectedRows === 0) {
        return{ status: "EVENTNOTFOUND" };
    }

    return { message: "Event updated" };
}

    async function getAllEvents(){
        try{
            const result =  await eventsRepo.getAllEvents();
            
            return result
            
        } catch(error) {
            throw error
        }
    }


module.exports = { 
    createEvent,
    getUserMadeEvents,
    getEvent,
    deleteEvent,
    updateEvent,
    getAllEvents
};
