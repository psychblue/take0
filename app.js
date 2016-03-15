/*
T.A.K.E main logic
*/

//Modules
//var fs = require("fs");
//var https = require("https");
var express = require("express");
var session = require("express-session");
//var stylus = require("stylus");
var routes = require("./routes/index");
var path = require("path");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var RedisStore = require("connect-redis")(session);
var logger = require("./logger/logger")(__filename);
//Configuration Manager
var confManager = require("./conf/conf");
var confParams = confManager.getParams();
var loginManager = require("./routes/login");
//User DB
var mysqlDb = require("./database/mysqldb");
mysqlDb.init({
		host: confParams.mysql.host,
		port: confParams.mysql.port,
		user: confParams.mysql.user,
		password: confParams.mysql.password,
		database: confParams.mysql.database
	});
//Redis for HTTP Session DB
var redis = require("redis").createClient(confParams.redis.port, confParams.redis.address);
logger.info("Redis Session DB is connected...");
//Loading Passport Module
var passport = require("./routes/set-passport");
//Configuration CLI Server Running;
confManager.initServer();
//Loading Express
var app = express();

//Express Settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Express Middlewares
//app.use(stylus.middleware(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: "false"}));
app.use(cookieParser());

//Express Session Settings
app.use(session({
	name: confParams.express_session.name,
	secret: confParams.express_session.secret,
	store: new RedisStore({client: redis}),
	resave: confParams.express_session.resave,
	saveUninitialized: confParams.express_session.saveUninitialized,
	cookie: {
		maxAge: confParams.express_session.cookie.maxAge
	}
}));

//Express Passport Setting
app.use(passport.initialize());
app.use(passport.session());

//Root Router
app.use("/", routes);

//Server Starting
//HTTP
var serverHttp = app.listen(confParams.http_server.port, function(){
	logger.info("=============== T.A.K.E. ==============");
	logger.info("Listening on port %d", serverHttp.address().port);
});

//HTTPS
/*
var httpsOptions = {key: fs.readFileSync("key.pem"), cert: fs.readFileSync("cert.pem")};
var serverHttps = https.createServer(httpsOptions, app).listen(8090, function(){
	logger.info("HTTPS on port %d", serverHttps.address().port);
});
*/
