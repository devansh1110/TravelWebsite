if(process.env.NODE_ENV != "production"){
  require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const expressError = require("./utils/expressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const cors = require("cors");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");


const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const { register } = require("module");
const userRouter = require("./routes/user.js");
// const authRoutes= require('./routes/auth.js');


const dbUrl= process.env.ATLASDB_URL;


main()
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.error(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); //spec
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(cors());

const store= MongoStore.create({
  mongoUrl: dbUrl,
  crypto:{
    secret: process.env.secret
  },
  touchAfter: 24 * 3600,
});

store.on("error", ()=>{
  console.log("Session Store Error", err);
})

const sessionOptions = {
  store,
  secret: process.env.secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.get("/", (req, res) => {
  res.send("Hi, I am Groot!");
});

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("success");
  res.locals.currUsr = req.user;
  next();
});

//listings
app.use("/listings", listings);
//reviews
// app.use('/listings:id/reviews', reviews);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
  next(new expressError(404, "|---ERROR---| Page not Found"));
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  let { statusCode = 500, message = "Something went wrong!!" } = error;
  console.log(error);
  res.sendStatus(statusCode).send(message);
});

app.listen(8080, () => {
  console.log("App is listening!");
});

// const defaultImage = {
//     filename: "default.jpg",
//     url: "https://unsplash.com/photos/a-street-sign-with-stickers-on-it-in-front-of-a-city-skyline-jHZowpnFbE0"
// };

// app.put('/listings/:id', async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { image, ...updateData } = req.body.listing;

//         // If image is not an object or is an empty string, set it to defaultImage
//         const imageData = typeof image === 'object' && Object.keys(image).length > 0 ? image : defaultImage;

//         await Listing.findByIdAndUpdate(id, { ...updateData, image: imageData });
//         res.redirect('/listings');
//     } catch (error) {
//         console.error('Error updating listing:', error.message);
//         // Handle the error appropriately, such as sending an error response
//         res.status(500).send('Error updating listing');
//     }
// });

// app.get("/testListing", async (req, res)=>{
//     let sampleListing= new Listing({
//         title: "The Roman ovs",
//         description: "The old vibes place to stay",
//         price: 1200,
//         location: "The 7th street",
//         country:  "New York, NY, US"
//     });
//     await  sampleListing.save();
//     console.log("sample was saved!!");
//     res.send("Successful");
// });

//reviews
// app.post('/listings/:id/reviews', async(req,res)=>{
//     let listing= await Listing.findById(req.params.id);
//     let newReview= new Review(req.body.review);

//     listing.reviews.push(newReview)
//     // await listing.save()
//     // res.redirect(`/listings/${listing._id}`)

//     await newReview.save();
//     await  listing.save();

//     console.log("Saved Review to database");
//     res.send("new review saved!!")
// });

// app.get("/demouser", async (req, res)=>{
//     let fakeUser= new User({
//         email: "apnaSapnaMoneyMoney@lafda.com",
//         username: "Harshad Mehta"
//     })
//    let registeredUser= await User.register(fakeUser, "Lafdacompany");
//    res.send(registeredUser);
// })

// app.use((error, req, res, next) => {
//     // Check if headers have already been sent
//     if (res.headersSent) {
//         // Call the next error handling middleware if headers are already sent
//         return next(error);
//     }

//     let { statusCode = 500, message = 'Something went wrong!!' } = error;
//     res.status(statusCode).send(message);
// });
