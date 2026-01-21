const authRepo = require('../repos/authRepo');

async function login(username, password) {
	return await authRepo.login(username, password);
}

module.exports = { login };