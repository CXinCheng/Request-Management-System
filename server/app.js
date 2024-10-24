const express = require("express");
const pgp = require("pg-promise")();
const dotenv = require("dotenv");

const app = express();

// Access .env file
dotenv.config();

const databaseConfig = {
    host: process.env.DATABASE_URL,
    port: process.env.DATABASE_PORT || 5432,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
};

const db = pgp(databaseConfig);

db.one("SELECT * FROM request.request")
    .then((data) => {
        console.log("DATA:", data.value);
    })
    .catch((error) => {
        console.log("ERROR:", error);
    });

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}.`);
});
