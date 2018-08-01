// ======= PACKAGES ======= 
var express =      require("express"),
    app =          express(),
    bodyParser =   require("body-parser"),
    mongoose =     require("mongoose"),
    passport =     require("passport"),
    LocalStrategy= require("passport-local"),
    methodOverride=require("method-override"),
    flash         =require("connect-flash"),
    shuffleSeed    =require("shuffle-seed");

// ======= DB STRUCTURES ======= 
var Campground = require("./models/campground"),
    Comment    = require("./models/comment"),
    User       = require("./models/user");

// ======= ROUTES =======
var commentRoutes    =   require("./routes/comments"),
    campgroundRoutes =   require("./routes/campgrounds"),
    authRoutes       =   require("./routes/auth");

// ======= SEED FILE ======= 
// var seedDB = require("./seeds");
// seedDB();

mongoose.connect(process.env.DATABASEURL);


app.use(bodyParser.urlencoded({extended: true}));//cookie-cutter
app.set("view engine", "ejs"); // makes ejs unneccessary in render
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// ===== PASSPORT CONFIGURATION =====
app.use(require("express-session")({
    secret: "bloop bloop",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));//used to authenticate user
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.locals.moment = require("moment");

//adds the current user to every request, and flash messages
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    next();
});

// ===== ROUTES =====
app.use("/posts", campgroundRoutes);
app.use("/posts/:id/comments",commentRoutes);
app.use(authRoutes);

var PORT = process.env.PORT || 3000;
app.listen(PORT, function(){
    console.log("ReplyAll running on port 3000");
});