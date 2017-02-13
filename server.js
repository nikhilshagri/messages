var express = require('express');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var fs = require('fs');
var User = require('./models/user');
var mongoose = require('mongoose');

// express setup
var app = express();
app.set('view engine', 'ejs');
app.use('/styles', express.static('styles'));
app.use(passport.initialize());
app.use(passport.session());

// mongodb setup
const mongodb_url='mongodb://cynicaldevil:nikhils96@ds143539.mlab.com:43539/messages';
mongoose.connect(mongodb_url).then((err)=> {
    if(err) {
      console.log(err);
    } else {
      console.log('success!');
    }
  });

// passport setup
var oauth_data = JSON.parse(fs.readFileSync('./oauth_client_data.json')).web;
passport.use(new GoogleStrategy({
    clientID: oauth_data.client_id,
    clientSecret: oauth_data.client_secret,
    callbackURL: "http://localhost:8080/oauth2callback"
  },
  function(accessToken, refreshToken, profile, done) {

    console.log(profile)
    User.findOne({ google_id: profile.id }, function (err, user) {
        if(err) {
          console.log(err)
          return done(err, null);
        }
       else if(user!= null) {
          return done(null, user);
       }
    });
  }
));
passport.serializeUser(function(user, done) {
    console.log('USER SER: ',user.id);
    done(null, user.id);
});
passport.deserializeUser(function(id, done) {
    User.findOne({ google_id: id }, function(err, user) {
        console.log('USER DESER', user);
        done(err, user);
    });
});

app.get('/auth/google',
    passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] })
);

app.get('/oauth2callback',
    passport.authenticate('google', { failureRedirect: '/' }),
        function(req, res) {
            res.redirect('/');
        }
);

app.get('/', function (req, res) {
  res.render('index');
});

app.listen(8080, function () {
  console.log('Messages listening on port 8080!');
});
