const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");
// const wrapAsync = require('../utils/wrapAsync.js');

router.get("/signup", (req, res) => {
  res.render("users/signup.ejs");
});

router.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome to WanderLust...");
      res.redirect("/listings");
    });
  } catch (e) {
    req.flash("success", "User already exists");
    res.redirect("/signup");
  }
});

router.get("/login", (req, res) => {
  res.render("users/login.ejs");
});

router.post("/login",  (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return next(err); // Pass error to error-handling middleware
    }
    if (!user) {
      // Authentication failed
      req.flash("success", "Your Username or Password was incorrect");
      return res.redirect("/login");
    }
    req.logIn (user, (err) => {
      if (err) {
        return next(err); // Pass error to error-handling middleware
      }
      // Authentication successful
      req.flash("success", "Welcome Back to WanderLust.");
      return res.redirect("/listings");
    });
  })(req, res, next);
});

router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      next();
    }
    req.flash("success", "You are logged out now!");
    res.redirect("/listings");
  });
});

module.exports = router;



//another way or the orignal way to implement the login from

//router.post(
  //   "/login",
  //   saveRedirectUrl,
  //   passport.authenticate("local", {
  //     failureRedirect: "/login",
  //     failureFlash: true,
  //   }),
  //   async (req, res) => {
  //     req.flash("success", "Welcome back to WanderLust.");
  //     res.redirect("/listings");
  //   }
  // );
  