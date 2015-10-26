/*
T.A.K.E main logic
*/

//Modules
var fs = require('fs');
var https = require('https');
var express = require('express');
var session = require('express-session');
//var stylus = require('stylus');
var routes = require('./routes/index');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var mysql = require('mysql');
var RedisStore = require('connect-redis')(session);
var logger = require('winston');

var app = express();

//Logger Settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.File, {filename: 'take0_main.log'});

//Express Settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Express Middlewares
//app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(cookieParser());

//Redis for HTTP Session DB
var redis = require("redis").createClient(6379, 'localhost');

//Express Session Settings
app.use(session({
	name: 'TAKE0',
	secret: 'IALWAYSCU8219!',
	store: new RedisStore({client: redis}),
	resave: 'true',
	saveUninitialized: 'false'
}));

//MySQL User DB Settings
var mysqlDb = mysql.createConnection({
	host: "localhost",
	port: 3306,
	user: "psychblue",
	password: "8219kjs",
	database: "take0"
});
mysqlDb.connect();

//Passport Settings
var passport = require('./routes/login').getPassport(app, mysqlDb);

//Root Router
app.use('/', routes(passport, mysqlDb));

//Server Starting
//HTTP
var serverHttp = app.listen(8080, function(){
	logger.info('T.A.K.E., Listening on port %d', serverHttp.address().port);
});

//HTTPS
var httpsOptions = {key: fs.readFileSync('key.pem'), cert: fs.readFileSync('cert.pem')};
var serverHttps = https.createServer(httpsOptions, app).listen(8090, function(){
	logger.info('HTTPS on port %d', serverHttps.address().port);
});
