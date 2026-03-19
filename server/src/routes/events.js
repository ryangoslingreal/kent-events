//This file takes in the request given by the frontend 
//This file will also deal with converting errors/outcomes to HTTP responses e.g. 500 server error
//It also deals with basic input validation, like making sure fields exist

const { Router } = require("express");
const multer = require("multer");    //for parsing FormData object
const eventService = require("../services/eventService");

const router = Router();

//For reading the FormData
const upload = multer({ storage: multer.memoryStorage() });

//Passes data onto eventService and does error checks on the data
router.post("/create-event", upload.single("image"), async (req, res) => {
    //authentication check
    if (!req.session.user) {
        return res.status(401).json({ message: "You are not authenticated, please sign in to use this feature." });
    }


    const { 
        title, 
        subtitle, description, 
        image_mime, 
        event_date, event_time, 
        location, 
        tags, 
        price, 
        repeat_event, 
        available_contact
    } = req.body;

    //Basic validation 
    if (!title || !description || !event_date || !event_time || !location || !available_contact) {
        return res.status(400).json({ message: "Form input requirement is missing." });
    }
    //deconstructing contactInfo
    // As FormData is now being used, contactinfo (bool) is turned into a string (unlike in json), so this needs to be automatically set now
    let intContactInfo = (available_contact === "true") ? 1 : 0;
    
    try {
        await eventService.createEvent(
            title, 
            subtitle, description, 
            req.file ?? null, 
            image_mime, 
            event_date, event_time, 
            location, 
            tags, 
            price, 
            repeat_event, 
            intContactInfo,
            req.session.user.id
        );
    } catch (error) {
        console.error("CREATE EVENT FAILED:", error);
        return res.status(500).json({ message: "Server error.", error: error.message, code: error.code });
    }

    return res.status(201).json({ message: "Created event successfully." });
});

router.get("/get-user-made-events", async(req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "You are not authenticated, please sign in to use this feature." });
    }
    
    let events;
    try {
        events = await eventService.getUserMadeEvents(req.session.user.id)     
    } catch (error) {
        console.error("get-user-made-events error:", error);
        return res.status(500).json({ message: "Server error.", error: error.message, code: error.code });
    }

    return res.status(200).json(events);
})

//grabbing all data for one event
router.get("/get-event", async(req, res) => {
    try {
        let eventId = req.query.eventId;

        const result = await eventService.getEvent(eventId);
        let event = result[0]

        //This sends the image url to the frontend
        event.imageUrl = `${event.id}/image`; 

        return res.status(200).json(event);

    } catch (error) {
        console.error("get-event error:", error);
        return res.status(500).json({ message: "Server error.", error: error.message, code: error.code });
    }
})

router.delete("/delete-event", async(req, res) => {
    const eventId = req.query.eventId;
    
    let result;
    try {
        result = await eventService.deleteEvent(eventId);
    } catch (error) {
        console.error("delete-event error:", error);
        return res.status(500).json({message: "Server error.", error: error.message, code: error.code});
    }
    
    if (result.status === 'EVENTNOTFOUND') {
        return res.status(404).json({ message: "Event not found." });
    }

    return res.status(200).json(result);
})

router.put("/update-event", upload.single("image"), async(req, res) => {
    const { title, subtitle, description, image_mime , event_date, event_time, location, tags, price, repeat_event, available_contact } = req.body;
    const eventId = req.query.eventId;

    let intContactInfo = (available_contact === "true") ? 1 : 0;

    let result;
    try {
        result = await eventService.updateEvent(
            eventId, title, 
            subtitle, description,
            req.file ?? null, 
            image_mime, 
            event_date, event_time, 
            location, 
            tags, 
            price, 
            repeat_event, 
            intContactInfo
        );
    } catch (error) {
        console.error("update-event error:", error);
        return res.status(500).json({ message: "Server error.", error: error.message, code: error.code });
    }

    if (result.status === 'EVENTNOTFOUND') {
        return res.status(404).json({ message: "Event not found." });
    }

    return res.status(200).json(result);
})

router.get("/get-all-events", async(req, res) => {
    try{
        const result = await eventService.getAllEvents();

        if (!result || result.length === 0){
            return res.status(404).json({ message: "No events found" })
        }

        //This sends the image url to the frontend
        const events = result.map((event) => ({
            ...event,
            imageUrl: `${event.id}/image`, 
            image: undefined             //done to reduce how much is being sent back
        }))

        return res.status(200).json(events);
    } catch (error){
        console.error("get-all-events error:", error);
        return res.status(500).json({message: "Server error", error: error.message, code: error.code,});
    }
})

//THis creates an image url so that it can be called from the frontend
router.get("/:id/image", async(req, res) => {
    try{
        const event = await eventService.getEvent(req.params.id);
        
        if (!event[0] || !event[0].image) {
            return res.status(404).send("Event not found");
        }

        const image_type = event[0].image_mime

        res.setHeader("Content-Type", image_type);

        res.setHeader("Cache-Control", "public, max-age=86400");  //caches image for one day (browser will reuse the image till then)

        return res.send(event[0].image)
    } catch (error){
        console.error("get-event-image error:", error);
        return res.status(500).send({ message: "Server error", error: error.message, code: error.code });
    }
})

module.exports = router;