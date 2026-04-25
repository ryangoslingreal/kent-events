const { Router } = require("express");
const multer = require("multer");
const eventService = require("../services/eventService");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/create-event", upload.single("image"), async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Please sign in." });
    }

    const {
        title, subtitle, description,
        event_date, event_time, location,
        tags, price, repeat_event, available_contact
    } = req.body;

    if (!title || !description || !event_date || !event_time || !location || available_contact == null) {
        return res.status(400).json({ message: "Form input requirement is missing." });
    }
    
    let result;
    try {
        result = await eventService.createEvent(
            title,
            subtitle,
            description,
            req.file ?? null,
            event_date,
            event_time,
            location,
            tags,
            price,
            repeat_event,
            available_contact === true || available_contact === "true" ? 1 : 0,
            userId
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
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Please sign in." });
    }
    
    let events;
    try {
        events = await eventService.getUserMadeEvents(userId);
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
    const eventId = req.query.eventId;
    if (!isValidID(eventId)) {
        return res.status(400).json({ message: "A valid event ID is required." });
    }

    let event;
    try {
        event = await eventService.getEvent(eventId);
    } catch (error) {
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code 
        });
    }

    if (!event) {
        return res.status(404).json({ message: "Event not found." });
    }

    return res.status(200).json(event);
});

router.delete("/delete-event", async(req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Please sign in." });
    }

    const eventId = req.query.eventId;
    if (!isValidID(eventId)) {
        return res.status(400).json({ message: "A valid event ID is required." });
    }
    
    let result;
    try {
        result = await eventService.deleteEvent(eventId, userId);
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
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Please sign in." });
    }

    const eventId = req.query.eventId;
    if (!isValidID(eventId)) {
        return res.status(400).json({ message: "A valid event ID is required." });
    }

    const {
        title, subtitle, description, remove_image,
        event_date, event_time, location, tags,
        price, repeat_event, available_contact
    } = req.body;

    if (remove_image === "true" && req.file) {
        return res.status(400).json({ message: "Cannot upload and remove an image in the same request." });
    }

    let image;
    if (remove_image === "true") {
        image = null; // Clear image
    } else if (req.file) {
        image = req.file; // Replace image
    } else {
        image = undefined; // Do not touch image
    }

    let result;
    try {
        result = await eventService.updateEvent(
            Number(eventId),
            userId,
            title,
            subtitle,
            description,
            image,
            event_date,
            event_time,
            location,
            tags,
            price,
            repeat_event,
            available_contact === true || available_contact === "true" ? 1 : 0
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

    return res.status(200).json({
        message: "Event updated.",
        event: result.event
    });
});

router.get("/get-all-events", async(req, res) => {
    const rawLimit = Number.parseInt(req.query.limit, 10);
    const rawOffset = Number.parseInt(req.query.offset, 10);

    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 15; // Default 15
    const offset = Number.isInteger(rawOffset) && rawOffset >= 0 ? rawOffset : 0; // Default 0
    const sourceFilter = req.query.sourceFilter;
    const dateFilter = req.query.dateFilter;

    let events;
    try{
        events = await eventService.getAllEvents(limit, offset, sourceFilter, dateFilter);
    } catch (error){
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code 
        });
    }

    return res.status(200).json(events);
});

router.get("/:id/image", async(req, res) => {
    const eventId = req.params.id;
    if (!isValidID(eventId)) {
        return res.status(400).json({ message: "A valid event ID is required." });
    }

    let event;
    try {
        event = await eventService.getEvent(eventId, { mode: "image" });
    } catch (error){
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code
        });
    }

    if (!event) {
        return res.status(404).send("Event not found");
    }

    if (!event.image) {
        return res.status(204).send("Event has no image");
    }

    res.setHeader("Content-Type", event.image_mime);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    return res.send(event.image);
});

function getSessionUserId(req) {
    const userId = Number(req.session.user?.id);
    return Number.isInteger(userId) && userId > 0 ? userId : null;
}

function isValidID(id) {
    return typeof id === "string" && /^-?\d+$/.test(id);
}

module.exports = router;