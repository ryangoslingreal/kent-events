const { makeTestEmail, registerAndLoginTestUser } = require("./authTestingUtils.js");
const { createTestEvent } = require("./eventsTestingUtils.js");

async function createTestUserAndEvent(
    agent,
    {
        email = makeTestEmail(),
        password = "testpassword",
        eventPayload = {},
        image = null
    } = {}) {
    const { res: userRes } = await registerAndLoginTestUser(agent, email, password);
    const { res: eventRes } = await createTestEvent(agent, eventPayload, image);

    return { userRes, eventRes };
}

module.exports = {
    createTestUserAndEvent
};