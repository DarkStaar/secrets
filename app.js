require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(session({
  secret: "Somestringthatwillbeinenvfile",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set("useCreateIndex", true);

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

const port = process.env.PORT || 3000;


app.get('/', (req, res) => {
  res.render('home');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({email: username}, (err, foundUser) => {
    if(err){
      console.log(err);
    }else {
      if (foundUser) {
        bcrypt.compare(password, foundUser.password, function(err, result) {
          if(result === true){
            res.render("secrets");
          }else {
            res.send("Wrong password!");
          }
        });
        }
      }
  });
});

app.get("/register", (req, res) => {
  res.render('register');
});

app.post("/register", (req,res) => {

  bcrypt.hash(req.body.password, 10, function(err, hash) {
    const newUser = new User(
      {email: req.body.username,
       password: hash}
    );

    newUser.save(function(err){
      if(!err){
        res.render("secrets");
      }else {
        console.log(err);
      }
    });
    });

    });
app.listen(port, () => console.log(`Server started at port: ${port}`)
);
