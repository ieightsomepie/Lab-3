const dotenv = require('dotenv');

dotenv.config();
const mysql = require('mysql2');

const dbConfig = {
    host: process.env.host || "localhost",
    port: parseInt(process.env.port || "3306"),
    user: process.env.user,
    password: process.env.password,
    database: process.env.database,
    connectTimeout: parseInt(process.env.connectTimeout || "10000")
}

const connection = mysql.createConnection(dbConfig);

module.exports = connection;