const request = require("supertest");

function createTestAgent(app) {
    return request.agent(app);
}

module.exports = {
    createTestAgent
}