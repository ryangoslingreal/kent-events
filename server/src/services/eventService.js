const eventsRepo = require('../repos/eventsRepo');

async function createEvent(title, subtitle, description, date, time, location, tag, price, repeat, contactInfo) {
    try{
        await eventsRepo.createEvent(title, subtitle, description, date, time, location, tag, price, repeat, contactInfo);

    } catch (error){
        throw error
    }
}


module.exports = { 
    createEvent 
};