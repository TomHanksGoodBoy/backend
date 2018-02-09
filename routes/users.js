var express = require('express');
var router = express.Router();
var User = require('../models/user');
var routes = require('./imagefile');
var Image = require('../models/files');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

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
                return res.redirect('/users/After_User_Login');
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
                return res.redirect('/users/After_User_Login');
            }
        });
    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

// GET route after registering
router.get('/After_User_Login', function (req, res, next) {
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
                  // var count1 = 0;
                   Image.find({ aadhaar: user.aadhaar }, function (err, image) {
                   if (err) return handleError(err);
                   console.log(image);
                  //console.log(Image.originalname);
                  // Image.count({ aadhaar: user.aadhaar }, function (err, count) {
                  //   if (err) return handleError(err);
                  //   count1 = count;
                  // });
                    res.render('After_User_Login',{ name: user.name ,
                                                    aadhaar: user.aadhaar ,
                                                    email: user.email ,
                                                    mobile: user.mobile,
                                                    image: image
                                                    });
                 });

                }
            }
        });
});


// function getName(callback){
//     db.test.find({aadhaar: user.aadhaar}, function(err, objs){
//         var returnable_name;
//         console.log(objs.length);
//         if (objs.length == 1)
//         {
//             returnable_name = objs[0].name;
//             console.log(returnable_name); // this prints "Renato", as it should
//             callback(returnable_name);
//         }
//     });
// }



// GET for logout
router.get('/logout', function (req, res, next) {
        // delete session object
        // console.log(req.session);
        req.session.destroy(function() {

                res.redirect('/users/login');

        });

});


//URL : http://localhost:3000/images/
// To get all the images/files stored in MongoDB
router.get('/After_User_Login/images', function(req, res) {
//calling the function from index.js class using routes object..
routes.getImages(function(err, genres) {
    if (err) {
    throw err;
  }
    res.json(genres);
  });
});

// URL : http://localhost:3000/images/(give you collectionID)
// To get the single image/File using id from the MongoDB
router.get('/After_User_Login/images/:id', function(req, res) {

//calling the function from index.js class using routes object..
routes.getImageById(req.params.id, function(err, genres) {
    if (err) {
    throw err;
  }
    res.download(genres.path);
    //res.send(genres.path)
  });
});

module.exports = router;
