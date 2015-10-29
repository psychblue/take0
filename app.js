/*
T.A.K.E main logic
*/

//Modules
//var fs = require('fs');
//var https = require('https');
var express = require('express');
var session = require('express-session');
//var stylus = require('stylus');
var routes = require('./routes/index');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var RedisStore = require('connect-redis')(session);
var logger = require('./logger/logger')(__filename);
//User DB
var mysqlDb = require('./database/mysqldb');
//Redis for HTTP Session DB
var redis = require("redis").createClient(6379, 'localhost');
logger.info('Redis Session DB is connected...');
//Loading Passport Module
var passport = require('./routes/set-passport');

//Loading Express
var app = express();

//Express Settings
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Express Middlewares
//app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: 'false'}));
app.use(cookieParser());

//Express Session Settings
app.use(session({
	name: 'TAKE0',
	secret: 'IALWAYSCU8219!',
	store: new RedisStore({client: redis}),
	resave: 'true',
	saveUninitialized: 'false'
}));

//Express Passport Setting
app.use(passport.initialize());
app.use(passport.session());

//Root Router
app.use('/', routes);

//Server Starting
//HTTP
var serverHttp = app.listen(8080, function(){
	logger.info('=============== T.A.K.E. ==============');
	logger.info('Listening on port %d', serverHttp.address().port);
});

//HTTPS
/*
var httpsOptions = {key: fs.readFileSync('key.pem'), cert: fs.readFileSync('cert.pem')};
var serverHttps = https.createServer(httpsOptions, app).listen(8090, function(){
	logger.info('HTTPS on port %d', serverHttps.address().port);
});
*/
