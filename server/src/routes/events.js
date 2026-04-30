/**
 * Event Routes
 * 
 * This module handles event creation, retrieval, updating, deletion, listing,
 * and image serving endpoints. Most requests/responses are JSON, except image
 * uploads/downloads which use multipart form data and binary image responses.
 */

const { Router } = require("express");
const multer = require("multer");
const eventsService = require("../services/eventsService");
const { isValidEmail, isValidURL, isValidID } = require("../utils/utils");

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * POST /create-event
 * Creates a new event for the currently authenticated user.
 * 
 * @param {string} title - Event title
 * @param {string} description - Event description
 * @param {File} image - Optional uploaded event image
 * @param {string} date - Event date
 * @param {string} start_time - Event start time
 * @param {string} end_time - Optional event end time
 * @param {string} location - Event location
 * @param {string|string[]} tags - Event tags
 * @param {string} ticket_url - Optional ticket URL
 * @param {string} contact_email - Optional contact email
 * 
 * @returns {Object} JSON response with message and created event ID
 * 
 * @status 201 - Event created successfully
 * @status 400 - Invalid form data
 * @status 401 - Not authenticated
 * @status 500 - Server error
 */
router.post("/create-event", upload.single("image"), async (req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Please sign in." });
    }

    const {
        title, description,
        date, start_time, end_time,
        location, tags, ticket_url, contact_email
    } = req.body;

    if (
        !title || !description ||
        !date || !start_time ||
        !location ||
        (ticket_url && !isValidURL(ticket_url)) ||
        (contact_email && !isValidEmail(contact_email))
    ) {
        return res.status(400).json({ message: "Invalid form data." });
    }
    
    const image = req.file ?? null;

    let result;
    try {
        result = await eventsService.createEvent(
            userId,
            title,
            description,
            image,
            date,
            start_time,
            end_time ?? null,
            location,
            tags,
            ticket_url?.trim() ?? null,
            contact_email?.trim() ?? null
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

/**
 * PUT /update-event
 * Updates an event owned by the currently authenticated user.
 * Supports preserving, replacing, or removing the existing event image.
 * 
 * @param {string} eventId - Event ID passed as a query parameter
 * @param {string} title - Event title
 * @param {string} description - Event description
 * @param {File} image - Optional replacement event image
 * @param {string} remove_image - Whether to remove the current image
 * @param {string} date - Event date
 * @param {string} start_time - Event start time
 * @param {string} end_time - Optional event end time
 * @param {string} location - Event location
 * @param {string|string[]} tags - Event tags
 * @param {string} ticket_url - Optional ticket URL
 * @param {string} contact_email - Optional contact email
 * 
 * @returns {Object} JSON response with message and updated event
 * 
 * @status 200 - Event updated successfully
 * @status 400 - Invalid event ID / form data, or conflicting image action
 * @status 401 - Not authenticated
 * @status 403 - User does not own this event
 * @status 404 - Event not found
 * @status 500 - Server error
 */
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
        title, description, remove_image,
        date, start_time, end_time,
        location, tags, ticket_url, contact_email
    } = req.body;

    if (
        !title || !description ||
        !date || !start_time ||
        !location ||
        (ticket_url && !isValidURL(ticket_url)) ||
        (contact_email && !isValidEmail(contact_email))
    ) {
        return res.status(400).json({ message: "Invalid form data." });
    }

    if (remove_image === "true" && req.file) {
        return res.status(400).json({ message: "Cannot upload and remove an image in the same request." });
    }

    let image;
    if (remove_image === "true") {
        image = null; // Clear image
    } else if (req.file) {
        image = req.file; // Replace image
    } else {
        image = undefined; // Preserve image
    }

    let result;
    try {
        result = await eventsService.updateEvent(
            Number(eventId),
            userId,
            title,
            description,
            image,
            date,
            start_time,
            end_time ?? null,
            location,
            tags,
            ticket_url?.trim() ?? null,
            contact_email?.trim() ?? null
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

/**
 * DELETE /delete-event
 * Deletes an event owned by the currently authenticated user.
 * 
 * @param {string} eventId - Event ID passed as a query parameter
 * 
 * @returns {Object} JSON response with message
 * 
 * @status 200 - Event deleted successfully
 * @status 400 - Invalid or missing event ID
 * @status 401 - Not authenticated
 * @status 403 - User does not own this event
 * @status 404 - Event not found
 * @status 500 - Server error
 */
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
        result = await eventsService.deleteEvent(eventId, userId);
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

/**
 * GET /get-event
 * Returns a single event by event ID.
 * 
 * @param {string} eventId - Event ID passed as a query parameter
 * 
 * @returns {Object} JSON event object
 * 
 * @status 200 - Event returned successfully
 * @status 400 - Invalid or missing event ID
 * @status 404 - Event not found
 * @status 500 - Server error
 */
router.get("/get-event", async(req, res) => {
    const eventId = req.query.eventId;
    if (!isValidID(eventId)) {
        return res.status(400).json({ message: "A valid event ID is required." });
    }

    let event;
    try {
        event = await eventsService.getEvent(eventId);
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

/**
 * GET /get-all-events
 * Returns a paginated list of events, optionally filtered by source and date.
 * 
 * @param {string|number} limit - Maximum number of events to return
 * @param {string|number} offset - Number of events to skip
 * @param {string} sourceFilter - Optional source filter
 * @param {string} dateFilter - Optional date filter
 * 
 * @returns {Object[]} JSON array of events
 * 
 * @status 200 - Events returned successfully
 * @status 500 - Server error
 */
router.get("/get-all-events", async(req, res) => {
    const rawLimit = Number.parseInt(req.query.limit, 10);
    const rawOffset = Number.parseInt(req.query.offset, 10);

    const limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : 15; // Default 15
    const offset = Number.isInteger(rawOffset) && rawOffset >= 0 ? rawOffset : 0; // Default 0
    const sourceFilter = req.query.sourceFilter;
    const dateFilter = req.query.dateFilter;

    let events;
    try{
        events = await eventsService.getAllEvents(limit, offset, sourceFilter, dateFilter);
    } catch (error){
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code 
        });
    }

    return res.status(200).json(events);
});

/**
 * GET /get-user-made-events
 * Returns all events created by the currently authenticated user.
 * 
 * @returns {Object[]} JSON array of events
 * 
 * @status 200 - Events returned successfully
 * @status 401 - Not authenticated
 * @status 500 - Server error
 */
router.get("/get-user-made-events", async(req, res) => {
    const userId = getSessionUserId(req);
    if (!userId) {
        return res.status(401).json({ message: "Please sign in." });
    }
    
    let events;
    try {
        events = await eventsService.getUserMadeEvents(userId);
    } catch (error) {
        return res.status(500).send({
            message: "Server error",
            error: error.message,
            code: error.code
        });
    }

    return res.status(200).json(events);
});

/**
 * GET /:id/image
 * Returns the image for a specific event.
 * 
 * @param {string} id - Event ID passed as a route parameter
 * 
 * @returns {Buffer} Binary image response
 * 
 * @status 200 - Event image returned successfully
 * @status 204 - Event exists but has no image
 * @status 400 - Invalid event ID
 * @status 404 - Event not found
 * @status 500 - Server error
 */
router.get("/:id/image", async(req, res) => {
    const eventId = req.params.id;
    if (!isValidID(eventId)) {
        return res.status(400).json({ message: "A valid event ID is required." });
    }

    let event;
    try {
        event = await eventsService.getEvent(eventId, { mode: "image" });
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

module.exports = router;