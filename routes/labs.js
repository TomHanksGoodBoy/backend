var express = require('express');
var router = express.Router();
var Lab = require('../models/lab');

/* GET lab login page. */
router.get('/login', function(req, res, next) {
    res.render('labs');
});

router.get('/signup', function(req, res, next) {
    res.render('signup');
});

//POST route for registering
router.post('/signup', function (req, res, next) {

    if (req.body.name &&
        req.body.license &&
        req.body.password &&
        req.body.email &&
        req.body.mobile) {

        var labData = {
            email: req.body.email,
            name: req.body.name,
            password: req.body.password,
            license: req.body.license,
            mobile: req.body.mobile,
        }

        lab.create(labData, function (error, lab) {
            if (error) {
                return next(error);
            } else {
                req.session.labId = lab._id;
                return res.redirect('/labs/profile');
            }
        });

    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

router.post('/login', function (req, res, next) {

    if (req.body.loglabname && req.body.logpassword) {
        Lab.authenticate(req.body.loglabname, req.body.logpassword, function (error, lab) {
            if (error || !lab) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.labId = lab._id;
                return res.redirect('/labs/profile');
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
    lab.findById(req.session.labId)
        .exec(function (error, lab) {
            if (error) {
                return next(error);
            } else {
                if (lab === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    return next(err);
                } else {
                    return res.send('<h1>Name: </h1>' + lab.name + '<h2>License: </h2>' + lab.license + '<br><a type="button" href="/logout">Logout</a>')
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
                return res.redirect('/labs/profile');
            }
        });
    }
});

module.exports = router;
