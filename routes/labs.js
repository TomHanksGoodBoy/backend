var express = require('express');
var router = express.Router();
var Lab = require('../models/lab');
var multer = require('multer');
var mongoose = require('mongoose');
var routes = require('./imagefile');
//var routes = require('./imagefile');

/* GET lab login page. */
router.get('/login', function(req, res, next) {
    res.render('labs');
});

router.get('/signuplab', function(req, res, next) {
    res.render('signuplab');
});

//POST route for registering
router.post('/signuplab', function (req, res, next) {

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

        Lab.create(labData, function (error, lab) {
            if (error) {
                return next(error);
            } else {
                req.session.labId = lab._id;
                return res.redirect('/labs/After_Lab_Login');
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
                var err = new Error('Wrong userid or password.');
                err.status = 401;
                return next(err);
            } else {
                req.session.labId = lab._id;
                return res.redirect('/labs/After_Lab_Login');
            }
        });
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

// GET route after registering
router.get('/After_Lab_Login', function (req, res, next) {
    Lab.findById(req.session.labId)
        .exec(function (error, lab) {
            if (error) {
                return next(error);
            } else {
                if (lab === null) {
                    var err = new Error('Not authorized! Go back!');
                    err.status = 400;
                    return next(err);
                } else {
                    res.render('After_Lab_Login');
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
                return res.redirect('/labs/login');
            }
        });
    }
});

//------------------------------------------------------------------------------------


// To get more info about 'multer'.. you can go through https://www.npmjs.com/package/multer..
var storage = multer.diskStorage({
 destination: function(req, file, cb) {
 cb(null, 'uploads/')
 },
 filename: function(req, file, cb) {
 cb(null, file.originalname);
 }
});

var upload = multer({
 storage: storage
});



router.post('/After_Lab_Login', upload.any(), function(req, res, next) {

 //res.send(req.files);

//req.files has the information regarding the file you are uploading...
//from the total information, i am just using the path and the imageName to store in the mongo collection(table)

 var path = req.files[0].path;
 var imageName = req.files[0].originalname;
 var uploaded_aadhaar_file = req.body.uploaded_aadhaar_file;
 var newName = req.body.reportName;
 var imagepath = {};
 imagepath['path'] = path;
 imagepath['originalname'] = newName;
 imagepath['aadhaar'] = uploaded_aadhaar_file;
 //imagepath contains two objects, path and the imageName

 //we are passing two objects in the addImage method.. which is defined above..
 routes.addImage(imagepath, function(err) {

 })
});
module.exports = router;
