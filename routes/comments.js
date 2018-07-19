var express = require("express");
var router = express.Router({mergeParams: true});//mergeParams allows you to get URL params
var passport = require("passport");

var User = require("../models/user");
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middleware = require("../middleware");//automatically requires index.js

// ===========  NEW =========== 
router.get("/new", middleware.isLoggedIn, function(req, res){
    //find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            console.log(err);
        }
        else {
            var level = 0;
            res.render("comments/new", {campground: campground});//no parent comment
        }
    });
});

// =========== CREATE =========== 
router.post("/", middleware.isLoggedIn, function(req, res){
    //find campground by id
    Campground.findById(req.params.id, function(err, campground){
        if (err) {
            console.log(err);
            res.redirect("/posts");
        }
        else { 
            console.log(req.body);
            //create new comment
            Comment.create({text: req.body.comment.text}, function(err, comment){
                if (err) {
                    console.log(err);
                }
                else {
                    console.log("NEW COMMENT: "+comment);
                    //add username and _id to comment, then save
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    //save comment

                    campground.comments.push(comment);
                    campground.save();
                    res.redirect("/posts/"+campground._id);
                }
            });
        }
    });
});

// =========== EDIT =========== 
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
    Comment.findById(req.params.comment_id, function(err, foundComment){
        if (err) {
            res.redirect("back");
        }
        else {
            res.render("comments/edit", {comment: foundComment, campground_id: req.params.id});
        }
    })
});

// =========== UPDATE =========== 
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
        if (err) {
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment edited.");
            res.redirect("/posts/"+req.params.id);
        }
    });
});

// =========== DELETE =========== 
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
        if (err) {
            res.redirect("back");
        }
        else {
            req.flash("success", "Comment deleted.");
            res.redirect("/posts/"+req.params.id);
        }
    });
});

// =========== get: REPLY =========== 
router.get("/:comment_id/reply", middleware.isLoggedIn, function(req, res){
    // treating it like I'm editing the parent comment.
    Comment.findById(req.params.comment_id, function(err, parentComment){
        if (err) {
            res.redirect("back");
        }
        else {
            Campground.findById(req.params.id, function(err, campground){
                if (err) {
                    console.log(err);
                }
                else {
                    res.render("comments/reply", {campground: campground, parentComment: parentComment});
                }
            });
        }
    })
});

// =========== post: REPLY =========== 
router.post("/:comment_id/reply", middleware.isLoggedIn, function(req, res){
    //comment_id is parent comment
    Comment.findById(req.params.comment_id, function(err, parentComment){
        if (err) {
            res.redirect("back");
        }
        else {
            var uniqueName = "commentReply_" + parentComment._id;
            var newComment = {text: req.body[uniqueName]};
            //create new comment
            Comment.create(newComment, function(err, comment){
                if (err) {
                    console.log(err);
                }
                else {
                    //add username and _id to child comment, then save
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.parentId = req.params.comment_id;
                    comment.level = parentComment.level + 1;
                    comment.save();
                    //save comment
                    parentComment.children.push(comment);
                    parentComment.save();

                    req.flash("success", "Successfully replied to " + parentComment.author.username);
                    res.redirect("/posts/"+req.params.id);
                }
            });
        }
    });
});

module.exports = router;