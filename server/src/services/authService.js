const authRepo = require('../repos/authRepo');

async function login(email, password) {
	return await authRepo.login(email, password);
}

module.exports = { login };