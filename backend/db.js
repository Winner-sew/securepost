// db.js - Connexion à PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test de connexion
pool.connect((err, client, release) => {
    if (err) {
        console.error('❌ Erreur de connexion à PostgreSQL:', err.message);
    } else {
        console.log('✅ Connecté à PostgreSQL - securepost_db');
        release();
    }
});

module.exports = pool;