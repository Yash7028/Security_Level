require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
// const md5 = require("md5");
const bcrypt = require("bcrypt");
const saltRounds = 10;


const app = express();

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended: true}));

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true});

const userSchema =new mongoose.Schema({
    email : String ,
    password : String 
});
// encryption 

userSchema.plugin(encrypt , {secret : process.env.API_KEY, encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req,res){
    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email : req.body.username ,
            password : hash
            // password : md5(req.body.password) 
           });
            newUser.save()
            .then((comregister) => {
            res.render("secrets");
            })
            .catch((err) => {
                console.log(err);
            });
    });


});

app.post("/login", function (req, res) {
    
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }).exec()
        .then((foundUser) => {
            if (foundUser) {
                    // res.render("secrets");
                    // console.log(foundUser.password);
                    bcrypt.compare(password, foundUser.password, function(err, result) {
                        // result == true
                        if(result == true){
                            res.render("secrets");
                        }
                            else{
                                console.log(err);
                            }
        })
            } else {
                // User not found
                res.status(404).send("User not found");
            }
        })
        .catch(err => {
            console.log(err);
            // Handle the error, for example, by sending an error response.
            res.status(500).send("An error occurred.");
        });
});


app.listen(3000, function(){
    console.log(`server started on port 3000`);
});