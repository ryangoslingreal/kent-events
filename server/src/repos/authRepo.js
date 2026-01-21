const db = require('../db/pool');

async function login(email, password_hash) {
    const query = 'SELECT * FROM users WHERE email = $1 AND password_hash = $2';
    const values = [email, password_hash];
    const { rows } = await db.query(query, values);
    return rows[0];
}

module.exports = { login };