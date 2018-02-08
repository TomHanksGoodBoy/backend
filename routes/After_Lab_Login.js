var express = require('express');
var router = express.Router();

//Get the after user login page
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

module.exports = router;
