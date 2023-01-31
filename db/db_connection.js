const mysql = require('mysql2');

const dbConfig = {
    host: process.env.host || "localhost",
    port: 3306,
    user: "johpar24",
    password: "GQvk8eR3PRzv",
    database: "`webapp_p9_2223t2_johpar24`",
    connectTimeout: 10000
}

const connection = mysql.createConnection(dbConfig);

module.exports = connection;