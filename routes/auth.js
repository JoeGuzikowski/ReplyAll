var express = require("express");
var router = express.Router();
var passport = require("passport");

var User = require("../models/user");
var Campground = require("../models/campground");
var Comment = require("../models/comment");

// =========== ROOT =========== 
router.get("/", function(req, res){
    res.redirect("posts/5b4fe94358fb0b70e605a789");
    //res.render("landing");
});

// ===========
// AUTH ROUTES
// ===========

// SIGN UP
router.get("/register", function(req, res){
    res.render("register");
});

router.post("/register", function(req, res){
    var newUser = new User({username: req.body.username});
    User.register( newUser, req.body.password, function(err, user){
        if (err) {
            //let user know what happened here too.
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            req.flash("success", "Welcome to YelpCamp "+req.body.username);
            res.redirect("/posts");
        });
    });
});

// LOG IN
router.get("/login", function(req, res){
    res.render("login");
});

router.post("/login", passport.authenticate("local",
    {//this method is from passport-local-mongoose package
        successRedirect: "/posts",
        failureRedirect: "/login"
    })/*, function(req, res){ // don't need this
}*/);

router.get("/logout", function(req,res){
    req.logout();
    req.flash("success","Logged you out!");
    res.redirect("/");
});

module.exports = router;