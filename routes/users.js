var express = require('express'),
	router = express.Router(),
	csrf = require('csurf'),
	passport = require('passport'),
	sendMail = require('../mailer/sendMessage'),
 	Message = require('../model/message'),
	io = require('socket.io').listen(8080);


var csrfProtection = csrf(); 	
router.use(csrfProtection);


router.get('/profile', isLoggedIn, function(req, res, next) {
	if(!req.session.messages) {
		Message.find({user: req.user}, function(err, messages) {
			if (err) {
				console.log('error in finding user messages');
			}
			console.log(messages);
			req.session.messages = messages;
			res.render('user/profile', {messages: messages, hasMassages: req.session.messages.length > 0});
		});
	} else {
	  console.log(req.session.messages);
		res.render('user/profile', {messages: req.session.messages, hasMassages: req.session.messages.length > 0});
	}
});

router.get('/logout', isLoggedIn, function(req, res, next) {
  req.session.destroy(function (err) {
    res.redirect('/');
  });
});

router.use('/', notLoggedIn, function(req,res, next) {
	console.log('Calling middleware');
	next();
});


router.get('/signup', function(req, res, next) {
	var messages = req.flash('error');
	res.render('user/signup', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('local.signup', {
	failureRedirect: '/user/signup',
	failureFlash: true
}), function(req, res, next) {
	console.log(req.user);
	req.session.client = req.user;
	res.redirect('/user/profile');
});

router.get('/signin', function(req, res, next) {
	var messages = req.flash('error');
	res.render('user/signin', {csrfToken: req.csrfToken(), messages: messages, hasErrors: messages.length > 0});
});

router.post('/signin', passport.authenticate('local.signin', {
	failureRedirect: '/user/signin',
	failureFlash: true
}), function(req, res, next) {
	console.log(req.user);
	req.session.client = req.user;
	res.redirect('/user/profile');
});


io
.of('/new')
.on('connection', function (socket) {
	socket.on('new', function (data) {
	  sendMail({  //email options
		  from: socket.request.session.client.email, // sender address.  Must be the same as authenticated user if using Gmail.
		  to: data.email, // receiver
		  subject: data.subject, // subject
		  text: data.mailText // body
		}, function() {
				var message = new Message({
	    		user: socket.request.session.passport.user,
	    		to: data.email,
	    		text: data.mailText,
	    		subject: data.subject,
	  		});
	  		message.save(function(err, result) {
	  			if (err) {
	  				console.log('Error!');
	  			}
	  			var userMessages = socket.request.session.messages ? socket.request.session.messages : [];
	  			userMessages.push(message);
	  			socket.request.session.messages = userMessages;
	  			socket.request.session.save();
	  			socket.emit('render', {});	
	  		});
			});
  	});
	});


io
.of('/delete')
.on('connection', function (socket) {
	socket.on('delete', function (data) {
		console.log(data);
		Message.remove({ _id: data.id}, function (err) {
  		if (err) {
  			console.log(err);
  		}
  		socket.request.session.messages = deleteMessageById(socket.request.session.messages, data.id);
  		socket.request.session.save();
		});	
	});
});

function deleteMessageById(collection, id) {
	 return collection.filter(function(item) {
    return item._id !== id;
	});
}

module.exports = router;
module.exports.io = io;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

function notLoggedIn(req, res, next) {
	if (!req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}