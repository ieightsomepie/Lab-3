const db = require("./db_connection");
/**** Delete existing table, if any ****/

const drop_stuff_table_sql = "DROP TABLE IF EXISTS `stuff`;"

db.execute(drop_stuff_table_sql);

//Creates the table
const create_table = `
CREATE TABLE Countries (
    CountryID INT NOT NULL AUTO_INCREMENT,
    country_name VARCHAR(45) NOT NULL,
    country_population VARCHAR(45) NOT NULL,
    country_gdp VARCHAR(45) NOT NULL,
    PRIMARY KEY (CountryID)
    );
`
const read_stuff_table_sql = "SELECT * FROM Countries";

db.execute(read_stuff_table_sql, 
    (error, results) => {
        if (error) 
            throw error;

        console.log("Table 'Countries' initialized with:")
        console.log(results);
    }
);

db.end();