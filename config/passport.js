var passport = require('passport');
var User = require('../model/user');
var LocalStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done) {
	done(null, user.id);
});

passport.deserializeUser(function(id, done) {
	User.findById(id, function(err, user) {
		done(err, user);
	});
});

passport.use('local.signup', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback: true
	}, function(req, email, password, done) {
		req.checkBody('email', 'Invalid email address').notEmpty().isEmail();
		req.checkBody('password', 'Short password').notEmpty().isLength({min: 4});

		var errors = req.validationErrors();
		if (errors) {
			var messages = [];
			errors.forEach(function(error) {
				messages.push(error.msg);
			});
			return done(null, false, req.flash('error', messages))
		}

		User.findOne({'email': email}, function(err, user) {
			if (err) {
				return done(err);
			}

			if (user) {
				return done(err, false, { message: 'User with those email address exist.' })
			}

			var newUser = new User();
			newUser.email = email;
			newUser.password = newUser.encryptPassword(password);

			newUser.save(function(err, user) {
				if (err) {
					return done(err);
				}
				return done(null, newUser);
			});

		});
	}));

passport.use('local.signin', new LocalStrategy({
	usernameField: 'email',
	passwordField: 'password',
	passReqToCallback: true
}, function(req, email, password, done) {
	req.checkBody('email', 'Invalid email').notEmpty().isEmail();
	req.checkBody('password', 'Invalid password').notEmpty();

	var errors = req.validationErrors();
	if (errors) {
		var messages = [];
		errors.forEach(function(error) {
			messages.push(error.msg);
		});
		return done(null, false, req.flash('error', messages));
	}

	User.findOne({'email': email}, function(err, user) {
		console.log(user);
		if (err) {
			return done(err);
		}

		if (!user) {
			console.log('user not find');
			return done(null, false, {message: 'Could not find user with thise credentials.'});
		}

		if(!user.validPassword(password)) {
			console.log('unvalid password');
			return done(null, false, {message: 'Wrong password.'});
		}

		return done(null, user);
	});

}));

