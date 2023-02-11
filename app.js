//set up the server
const express = require( "express" );
const logger = require("morgan");
const app = express();
const port = 8080;
const db = require('./db/db_connection');

// Configure Express to use EJS
app.set( "views",  __dirname + "/views");
app.set( "view engine", "ejs" );

// define middleware that logs all incoming requests
app.use(logger("dev"));

// Configure Express to parse URL-encoded POST request bodies (traditional forms)
app.use( express.urlencoded({ extended: false }) );

// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + '/public'));

// define a route for the default home page
app.get( "/", ( req, res ) => {
    res.render('index');
});

// define a route for the stuff inventory page
const read_stuff_all_sql = `
    SELECT 
        CountryID, country_name, country_population, country_gdp
    FROM
        Countries
`
app.get( "/stuff", ( req, res ) => {
    db.execute(read_stuff_all_sql, (error, results) => {
        console.log(results)
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.render('stuff', { Countries : results });
        }
    });
} );

// define a route for the item detail page
const read_stuff_item_sql = `
    SELECT 
        CountryID, country_name, country_population, country_gdp
    FROM
        Countries
    WHERE 
        CountryID = ?    
`
app.get( "/stuff/item/:id", ( req, res ) => {
    db.execute(read_stuff_item_sql, [req.params.id], (error, results) => {
        if (error) {
            res.status(500).send(error); // Internal Server Error
        } else if (results.length == 0) {
            res.status(404).send(`No item found with id = '${req.params.id}'`);
        }
        else {
            let data = results[0];
            //data = {item: ____, quantity: ____, description: ____ }
            res.render('item', data);
        }
    });

} );
// define a route for item DELETE
const delete_item_sql = `
    DELETE 
    FROM
        Countries
    WHERE
        CountryID = ?
`
app.get("/stuff/item/:id/delete", ( req, res ) => {
    db.execute(delete_item_sql, [req.params.id], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect("/stuff");
        }
    });
})
// define a route for item Create
const create_item_sql = `
    INSERT INTO Countries
        (country_name, country_population, country_gdp)
    VALUES
        (?, ?, ?)
`
app.post("/stuff", ( req, res ) => {
    db.execute(create_item_sql, [req.body.country_name, req.body.country_population, req.body.country_gdp], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            //results.insertId has the primary key (id) of the newly inserted element.
            res.redirect(`/stuff/item/${results.insertId}`);
        }
    });
})
// define a route for item UPDATE
const update_item_sql = `
    UPDATE
        Countries
    SET
        country_name = ?,
        country_population = ?,
        country_gdp = ?
    WHERE
        CountryID = ?
`
app.post("/stuff/item/:id", ( req, res ) => {
    db.execute(update_item_sql, [req.body.name, req.body.population, req.body.gdp, req.params.id], (error, results) => {
        if (error)
            res.status(500).send(error); //Internal Server Error
        else {
            res.redirect(`/stuff/item/${req.params.id}`);
        }
    });
})
// start the server
app.listen( port, () => {
    console.log(`App server listening on ${ port }. (Go to http://localhost:${ port })` );
} );