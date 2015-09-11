// app.js

// Set up tools we are going to use
var express = require('express');
var path = require('path');
var port = process.env.PORT || 3000;
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var UserModel = require('./models/users');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');
var passportSocketIo = require("passport.socketio");
var app = express();
var http = require('http');
var io = require('socket.io');
var server = http.createServer(app);
var mysql = require('mysql');
var MySQLStore = require('express-mysql-session');
var options = { 
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'arthur310',
    database: 'gwent'
};
var connection = mysql.createConnection(options);
var sessionStore = new MySQLStore({}, connection);

// Set up passport
passport.use(new LocalStrategy(
	{
		// set the field name here
		usernameField: 'username',
		passwordField: 'password',
		passReqToCallback: true
	},
	function(req, username, password, done) {
		if (!req.user) {
			new UserModel.User({Username: username}).fetch().then(function(data) {
			  var user = data;
			  if(user === null) { 
				 return done(null, false, {message: 'Invalid username or password'});
			  } else {
				 user = data.toJSON();
				 if(!bcrypt.compareSync(password, user.Password)) {
					return done(null, false, {message: 'Invalid username or password'});
				 } else {
					return done(null, user);
				 }
			  }
			});
		}
	})
);
    
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(logger('dev'));

app.use(session({
		store: sessionStore,
		key: 'gwent',
		secret: 'arthur310',		
		resave: true,
		saveUninitialized: true,
		cookie: {
			maxAge: 30*60*1000, //1/2 Hour,
			expires: 30*60*1000,
		} // time im ms
    })
); 

passport.serializeUser(function(user, done) {
	done(null, user.ID);
});

passport.deserializeUser(function(id, done) {
    new UserModel.User({ID: id}).fetch().then(function(user) {
      done(null, user);
	});
});

// passport initialization
app.use(passport.initialize());
app.use(passport.session());

// routes ======================================================================
require('./routes/index.js')(app, passport); // load our routes and pass in our app and fully configured passport

// game server ======================================================================
game_server = require('./config/gameserver.js');

var sio = io.listen(server);

// Socket IO
sio.use(passportSocketIo.authorize({
  passport:     passport,
  cookieParser: require('cookie-parser'),
  key:          'gwent',
  secret:       'arthur310',
  store:        sessionStore,
  success:      onAuthorizeSuccess,
  fail:         onAuthorizeFail
}));

function onAuthorizeSuccess(data, accept){
  console.log('successful connection to socket.io');
  // If you use socket.io@1.X the callback looks different
  accept();	
}

function onAuthorizeFail(data, message, error, accept){
  //console.log('failed connection to socket.io:', data, message);
  // If you use socket.io@1.X the callback looks different
  // If you don't want to accept the connection
  if(error)
    accept(new Error(message));
  // this error will be sent to the user as a special error-package
  // see: http://socket.io/docs/client-api/#socket > error-object
}

sio.on('connection',function(socket){
    console.log('a user connect');
	socket.on('chat message', function(data){
		var msg = data.id + ': ' + data.message; 
		sio.emit('chat message', msg);
	});
	
	socket.on('faction', function(client){
		game_server.faction(client, sio);
	});
		
	socket.on('deck', function(client){
		game_server.deck(client, sio);
	});
	
});			

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


// Start the app
server.listen(port, "0.0.0.0", function() {
	console.log('\t :: Express :: Listening on port ' + port );
});


