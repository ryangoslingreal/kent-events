const { Router } = require("express");
const authService = require("../services/authService");

const router = Router();

router.get("/", (req, res) => {
  res.json([]);
});

module.exports = router;