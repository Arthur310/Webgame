//var passport = require('passport');
var bookshelf = require('./../config/db').bookshelf;
var bcrypt = require('bcrypt-nodejs');
var UserModel = require('./../models/users');
var SessModel = require('./../models/sessions');
var username;
var empty;
var signuperror;
var loginerror;

module.exports = function(app, passport) {

// normal routes ===============================================================

	// HOMEPAGE ==============================
	app.get('/', function(req, res) {	
		if (req.isAuthenticated()) {
			new UserModel.User({ID: req.user.id}).fetch().then(function(user) {
				username = user.get('Username');
				res.render('index', {username: username});
			});
		} else {	
			username = empty;
			res.render('index', {username: username});			
		}
  	});

	// LOGOUT ==============================
	app.get('/signout', function(req, res) {
		req.logout();
		req.session.destroy(
			function(err) {
				username = empty;
				res.redirect('/');
			}
		);
	});

	// CARD ==============================
	app.get('/Cards', function(req, res) {
		res.render('Cards');
	});
	
	app.get('/Monster', function(req, res) {
		res.render('Monster');
	});
	
	app.get('/Nilfgaardian', function(req, res) {
		res.render('Nilfgaardian');
	});
	
	app.get('/NorthernRealms', function(req, res) {
		res.render('NorthernRealms');
	});
	
	app.get('/Scoiatale', function(req, res) {
		res.render('Scoiatale');
	});
	
	app.get('/Special', function(req, res) {
		res.render('Special');
	});
	
	app.get('/Neutral', function(req, res) {
		res.render('Neutral');
	});

	// TAVERN ==============================
	app.get('/Tavern', function(req, res) {
		if(req.isAuthenticated()) {
			new UserModel.User({ID: req.user.id}).fetch().then(function(user) {
				username = user.get('Username');
				res.render('Tavern', {username: username});
			});						
		} else {
			res.redirect('/');  
		}
	});

	app.get('/login', function(req, res) {
		if(req.isAuthenticated()) {
			res.redirect('/');
		} else {
			res.render('login', {errorMessage: loginerror}); 
			loginerror = empty;
		}		
	});

	app.post('/login', function(req, res) {	
		// ask passport to authenticate
		passport.authenticate('local',
			{ successRedirect: '/',
			failureRedirect: '/login'},
			function(err, user, info) {
				if (err) {
				  // if error happens
				  loginerror = err.message;
				  res.redirect('/login');
				}
				if (!user) {
				  // if authentication fail, get the error message that we set
				  // from previous (info.message) step, assign it into to
				  // req.session and redirect to the login page again to display
				  loginerror = info.message;
				  res.redirect('/login');
				} else {					
					var sessions = new SessModel.Sessions();
					sessions.query(function(qb)
			{qb.where('data', 'LIKE', '%user":' + user.ID + '}}');}).fetch().then(function(model) {
						if(model) {
							//return res.render('login', {errorMessage: 'User has already logged in'});
							loginerror = 'User has already logged in'; 
							res.redirect('/login');
						} else {
							req.login(user, function(err) {
								if (err) {
									return res.render('login', {errorMessage: err.message});
								} else {
									req.user = user;  
									res.redirect('/');
								}
							});
						}
					});
				}
			}
		)(req, res);
	});

	app.get('/signup', function(req, res) {
		res.render('signup', {errorMessage: signuperror});
		signuperror = empty;
	});

	app.post('/signup', function(req, res) {
	   var user = req.body.username;
	   var usernamePromise = null;
	   usernamePromise = new UserModel.User({Username: user}).fetch();	   
	   return usernamePromise.then(function(model) {
		  if(model) {
			 signuperror = 'Username already exists'; 
			 res.redirect('/signup');
		  } else {
			 //****************************************************//
			 // MORE VALIDATION GOES HERE(E.G. PASSWORD VALIDATION)
			 //****************************************************//
			var password = req.body.password;
			var email = req.body.email;
			var hash = bcrypt.hashSync(password);

			var signUpUser = new UserModel.User({Username: user, Email: email, Password: hash});
			signUpUser.save().then(function(model) {
				return bookshelf.knex.schema.createTable(user, function(table) {
					table.increments('ID').primary();
					table.integer('NorthID')
						.unsigned()
						.unique()
						.references('NorthID')
						.inTable('northernrealms')
						.onDelete('CASCADE')
						.onUpdate('CASCADE');
					table.integer('NilfID')
						.unsigned()
						.unique()
						.references('NilfID')
						.inTable('nilfgaardianempire')
						.onDelete('CASCADE')
						.onUpdate('CASCADE');
					res.redirect('/login');
				});					
			});			
		  }
	   });
	});
};