require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const md5 = require("md5");
const bcrypt = require("bcryptjs");

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true, useUnifiedTopology: true});

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

const User = mongoose.model("User", userSchema);

const app = express();

const port = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

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
