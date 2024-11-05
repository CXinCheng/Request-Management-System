const pgp = require("pg-promise")();
const dotenv = require("dotenv");

dotenv.config();

const databaseConfig = {
    host: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
};

const db = pgp(databaseConfig);

module.exports = db;