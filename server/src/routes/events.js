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
    if (!req.session.user) {
        return res.status(401).json({ message: "Please sign in." });
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

    if (!title || !description || !event_date || !event_time || !location || !available_contact) {
        return res.status(400).json({ message: "Form input requirement is missing." });
    }

    //deconstructing contactInfo
    // As FormData is now being used, contactinfo (bool) is turned into a string (unlike in json), so this needs to be automatically set now
    let intContactInfo = (available_contact === "true") ? 1 : 0;
    
    let result;
    try {
        result = await eventService.createEvent(
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
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code 
        });
    }

    return res.status(201).json({ message: "Created event successfully.", eventId: result.insertId });
});

router.get("/get-user-made-events", async(req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Please sign in." });
    }
    
    let events;
    try {
        events = await eventService.getUserMadeEvents(req.session.user.id)
    } catch (error) {
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code 
        });
    }

    return res.status(200).json(events);
});

router.get("/get-event", async(req, res) => {
    try {
        const eventId = req.query.eventId;
        if (!isValidID(eventId)) {
            return res.status(400).json({ message: "A valid event ID is required." });
        }

        const event = await eventService.getEvent(eventId);

        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        return res.status(200).json({
            ...event,
            imageUrl: `${event.id}/image` // Attach image URL
        }
            
        );
    } catch (error) {
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code 
        });
    }
});

router.delete("/delete-event", async(req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Please sign in." });
    }

    const eventId = req.query.eventId;
    if (!isValidID(eventId)) {
        return res.status(400).json({ message: "A valid event ID is required." });
    }
    
    let result;
    try {
        result = await eventService.deleteEvent(eventId, req.session.user.id);
    } catch (error) {
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code 
        });
    }
    
    if (result.status === "EVENTNOTFOUND") {
        return res.status(404).json({ message: "Event not found." });
    }

    if (result.status === "FORBIDDEN") {
        return res.status(403).json({ message: "You are not allowed to delete this event." });
    }

    return res.status(200).json({ message: "Event deleted." });
});

router.put("/update-event", upload.single("image"), async(req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ message: "Please sign in." });
    }

    const eventId = req.query.eventId;
    if (!isValidID(eventId)) {
        return res.status(400).json({ message: "A valid event ID is required." });
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

    let intContactInfo = (available_contact === "true") ? 1 : 0;

    let result;
    try {
        result = await eventService.updateEvent(
            Number(eventId), req.session.user.id,
            title, 
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
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code 
        });
    }

    if (result.status === "EVENTNOTFOUND") {
        return res.status(404).json({ message: "Event not found." });
    }

    if (result.status === "FORBIDDEN") {
        return res.status(403).json({ message: "You are not allowed to update this event." });
    }    

    return res.status(200).json(result);
});

router.get("/get-all-events", async(req, res) => {
    const rawLimit = Number.parseInt(req.query.limit, 10);
    const rawOffset = Number.parseInt(req.query.offset, 10);

    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 15; // Default 15
    const offset = Number.isInteger(rawOffset) && rawOffset >= 0 ? rawOffset : 0; // Default 0
    const sourceFilter = req.query.sourceFilter;
    const dateFilter = req.query.dateFilter;

    try{
        const result = await eventService.getAllEvents(limit, offset, sourceFilter, dateFilter);

        const events = result.map((event) => ({
            ...event,
            imageUrl: `${event.id}/image` // Send image url
        }));

        return res.status(200).json(events);
    } catch (error){
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code 
        });
    }
});

router.get("/:id/image", async(req, res) => {
    try {
        const eventId = req.params.id;
        if (!isValidID(eventId)) {
            return res.status(400).json({ message: "A valid event ID is required." });
        }

        const event = await eventService.getEvent(eventId);
        
        if (!event) {
            return res.status(404).send("Event not found");
        }

        if (!event.image) {
            return res.status(204).send("Event has no image");
        }

        res.setHeader("Content-Type", event.image_mime);
        res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 1 day
        return res.send(event.image);
    } catch (error){
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code 
        });
    }
});

function isValidID(id) {
    return typeof id === "string" && /^-?\d+$/.test(id);
}

module.exports = router;