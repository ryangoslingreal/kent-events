const authRepo = require('../repos/authRepo');

async function login(email, password_hash) {
    return await authRepo.login(email, password_hash);
}

async function register(email, password_hash) {
    try {
        return await authRepo.register(email, password_hash);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') { // MySQL duplicate entry error code
            const duplicateError = new Error('User with this email already exists');
            duplicateError.code = 'DUPLICATE_USER'; // Repackage as custom error code
            throw duplicateError;
        }

        throw error;
    }
}

module.exports = { login, register };