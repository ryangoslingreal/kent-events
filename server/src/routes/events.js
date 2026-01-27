//This file takes in the request given by the frontend 
//This file will also deal with converting errors/outcomes to HTTP responses e.g. 500 server error
//It also deals with basic input validation, like making sure fields exist

const { Router } = require("express");
const eventService = require("../services/eventService");

const router = Router();

//Passes data onto eventService and does error checks on the data
router.post("/create-event", async (req, res) => {
    const { title, subtitle, description, date, time, location, tag, price, repeat, contactInfo } = req.body;
    console.log(req.body)
    //Basic validation 
    if (!title || !description || !date || !time || !location || !contactInfo) {
        return res.status(400).json({ message: "Form input requirement is missing" });
    }
    
    try{
        
        await eventService.createEvent(title, subtitle, description, date, time, location, tag, price, repeat, contactInfo)

        return res.status(201).json({
            message: "Created event successfully",
        })
    } catch (error){
        console.error("CREATE EVENT FAILED:", error);
        return res.status(500).json({message: "Server error", error: error.message, code: error.code,});
    }
});

module.exports = router;