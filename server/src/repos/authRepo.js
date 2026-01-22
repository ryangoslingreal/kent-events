const db = require('../db/pool');

async function login(email, password_hash) {
    const query = 'SELECT * FROM users WHERE email = $1 AND password_hash = $2';
    const values = [email, password_hash];
    const { rows } = await db.query(query, values);
    return rows[0];
}

async function register(email, password_hash) {
    const query = 'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *';
    const values = [email, password_hash];
    const { rows } = await db.query(query, values);
    return rows[0];
}

module.exports = { login, register};