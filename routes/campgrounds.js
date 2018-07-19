var express = require("express");
var router = express.Router();
var passport = require("passport");

var User = require("../models/user");
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middleware = require("../middleware");//automatically requires index.js

// =========== INDEX =========== 
router.get("/", function(req, res){
    res.redirect("posts/5b4fe94358fb0b70e605a789");
    // // get all posts from db
    // Campground.find({}, function(err, posts){
    //     if (err) {
    //         console.log(err);
    //     } else {
    //         res.render("posts/index", {posts: posts, currentUser: req.user});
    //     }
    // });
});

// =========== NEW =========== 
router.get("/new", middleware.isLoggedIn, function(req, res){
    res.render("posts/new");
});

// =========== CREATE =========== 
router.post("/", middleware.isLoggedIn, function(req, res){    
    var name        = req.body.camp.name,
        image       = req.body.camp.image,
        description = req.body.camp.description,
        price       = req.body.camp.price;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    // Create a new campground and save to DB
    var newCampground = {name: name, price: price, image: image, description: description, author: author}

    console.log(newCampground);
    Campground.create(newCampground, function(err, newlyCreated){
        if (err) {
            req.flash("error", err.message);
            res.redirect("/posts");
        }
    });
});
// =========== SHOW =========== 
router.get("/:id", function(req, res){
    //find the campground with provided id 
    //populate fills IDs with the actual comments in the DB array
    Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
        if (err) {
            console.log(err);
        }
        else {
            Comment.find(function(err, allComments){
                res.render("posts/show", {campground: foundCampground, threads: allComments});
            });
        }
    });
});

// ===== EDIT =====
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        //won't be an error since middleware checks
        res.render("posts/edit",{campground: foundCampground});
    });
});
// ===== UPDATE =====
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, oldCampground){
        if(err){
            res.redirect("/posts");
        }
        else {
            req.flash("success", "Successfully edited campground information.");
            res.redirect("/posts/" + req.params.id);
        }
    });
});

// ===== DESTROY =====
router.delete("/:id", middleware.checkCampgroundOwnership, function(req, res){posts
    Campground.findByIdAndRemove(req.params.id, function(err){
        if (err) {
            res.redirect("/posts");
        }
        else {
            req.flash("success", "Successfully deleted campground.");
            res.redirect("/posts");
        }
    });
});

module.exports = router;