var express = require('express');
var router = express.Router();
var User = require('../models/user');

/* GET user login page. */
router.get('/login', function(req, res, next) {
    res.render('users');
});

router.get('/signup', function(req, res, next) {
    res.render('signup');
});

//POST route for registering
router.post('/signup', function (req, res, next) {

    if (req.body.name &&
        req.body.aadhaar &&
        req.body.password &&
        req.body.email &&
        req.body.mobile) {

        var userData = {
            email: req.body.email,
            name: req.body.name,
            password: req.body.password,
            aadhaar: req.body.aadhaar,
            bloodGrp: req.body.bloodGrp,
            mobile: req.body.mobile,
        }

        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/users/profile');
            }
        });

    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

router.post('/login', function (req, res, next) {

    if (req.body.logusername && req.body.logpassword) {
        User.authenticate(req.body.logusername, req.body.logpassword, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.userId = user._id;
                return res.redirect('/users/profile');
            }
        });
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

// GET route after registering
router.get('/profile', function (req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                if (user === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    return next(err);
                } else {
                    return res.send('<h1>Name: </h1>' + user.name + '<h2>Mail: </h2>' + user.aadhaar + '<br><a type="button" href="/users/login">Logout</a>')
                }
            }
        });
});

// GET for logout
router.get('/logout', function (req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function (err) {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/users/login');
            }
        });
    }
});

module.exports = router;
