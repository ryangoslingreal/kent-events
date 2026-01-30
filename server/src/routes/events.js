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
   
    // console.log("file:", req.file); // uploaded file (if any)            --to print out image file
    const { title, subtitle, description, date, time, location, tags, price, repeat, contactInfo } = req.body;
    

    //Basic validation 
    if (!title || !description || !date || !time || !location || !contactInfo) {
        return res.status(400).json({ message: "Form input requirement is missing" });
    }
    //deconstructing contactInfo
    // As FormData is now being used, contactinfo (bool) is turned into a string (unlike in json), so this needs to be automatically set now
    let intContactInfo
    if (contactInfo === "true"){
        intContactInfo = 1
    } else{
        intContactInfo = 0
    }
    
    try{
        
        await eventService.createEvent(title, subtitle, description, req.file ?? null, date, time, location, tags, price, repeat, intContactInfo)

        return res.status(201).json({
            message: "Created event successfully",
        })
    } catch (error){
        console.error("CREATE EVENT FAILED:", error);
        return res.status(500).json({message: "Server error", error: error.message, code: error.code,});
    }
});

module.exports = router;