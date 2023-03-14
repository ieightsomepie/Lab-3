//set up the server
const express = require( "express" );
const logger = require("morgan");
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const port = process.env.PORT || 8080;
const db = require('./db/db_pool');
const helmet = require("helmet");
const { auth } = require('express-openid-connect');
const { requiresAuth } = require('express-openid-connect');
app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'cdnjs.cloudflare.com'],
        styleSrc: ["'self'", 'cdnjs.cloudflare.com', 'fonts.googleapis.com'],
        fontSrc: ["'self'", 'fonts.googleapis.com']
      }
    }
})); 
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.AUTH0_SECRET,
  baseURL: process.env.AUTH0_BASE_URL,
  clientID: process.env.AUTH0_CLIENT_ID,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL
};
  
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));
app.use((req, res, next) => {
    res.locals.isLoggedIn = req.oidc.isAuthenticated();
    res.locals.user = req.oidc.user;
    next();
})
app.get('/profile', requiresAuth(), (req, res) => {
    res.send(JSON.stringify(req.oidc.user));
});
  
// Configure Express to use EJS
app.set( "views",  __dirname + "/views");
app.set( "view engine", "ejs" );

// define middleware that logs all incoming requests
app.use(logger("dev"));

// Configure Express to parse URL-encoded POST request bodies (traditional forms)
app.use( express.urlencoded({ extended: false }) );

// define middleware that serves static resources in the public directory
app.use(express.static(__dirname + '/public'));
// req.isAuthenticated is provided from the auth router
app.get('/', (req, res) => {
    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
});
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
    WHERE
        userid = ?
`
app.get( "/stuff", requiresAuth(),( req, res ) => {
    db.execute(read_stuff_all_sql, [req.oidc.user.email], (error, results) => {
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
    AND
        userid = ?
`
app.get( "/stuff/item/:id", requiresAuth(),( req, res ) => {
    db.execute(read_stuff_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
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
    AND
        userid = ?
`
app.get("/stuff/item/:id/delete", requiresAuth(),( req, res ) => {
    db.execute(delete_item_sql, [req.params.id, req.oidc.user.email], (error, results) => {
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
        (country_name, country_population, country_gdp, userid)
    VALUES
        (?, ?, ?, ?)
`
app.post("/stuff", requiresAuth(),( req, res ) => {
    db.execute(create_item_sql, [req.body.country_name, req.body.country_population, req.body.country_gdp, req.oidc.user.email], (error, results) => {
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
    AND
        userid = ?
`
app.post("/stuff/item/:id", requiresAuth(),( req, res ) => {
    db.execute(update_item_sql, [req.body.name, req.body.population, req.body.gdp, req.params.id, req.oidc.user.email], (error, results) => {
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