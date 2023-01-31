const mysql = require('mysql2');

const dbConfig = {
    host: "sqlclassdb-instance-1.cqjxl5z5vyvr.us-east-2.rds.amazonaws.com",
    port: 3306,
    user: "johpar24",
    password: "GQvk8eR3PRzv",
    database: "`webapp_p9_2223t2_johpar24`",
    connectTimeout: 10000
}

const connection = mysql.createConnection(dbConfig);

module.exports = connection;