var express = require('express'),
	router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
	res.render('index');
});

module.exports = router;

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}

