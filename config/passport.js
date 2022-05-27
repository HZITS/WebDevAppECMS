let LocalStrategy = require('passport-local').Strategy;
let User = require('../models/user');
let bcrypt = require('bcryptjs');

let GoogleStrategy = require('passport-google-oauth20').Strategy;

module.exports = function (passport) {

    passport.use(User.createStrategy());

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user);
        });
    });

    passport.use(new GoogleStrategy({
            clientID: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            callbackURL: "http://localhost:8000/auth/google/ecms"
        },
        function (accessToken, refreshToken, profile, cb) {
            User.findOrCreate({
                    googleId: profile.id,
                    admin: 0
                }, function (err, user) {
                return cb(err, user);
            });
        }
    ));

    passport.use(new LocalStrategy(function (username, password, done) {

        User.findOne({username: username}, function (err, user) {
            if (err)
                console.log(err);

            if (!user) {
                return done(null, false, {message: 'No user found!'});
            }

            bcrypt.compare(password, user.password, function (err, isMatch) {
                if (err)
                    console.log(err);

                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {message: 'Wrong password.'});
                }
            });
        });

    }));

}

