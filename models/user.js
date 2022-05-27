let mongoose = require('mongoose');
let findOrCreate = require('mongoose-findorcreate');
let passportLocalMongoose = require('passport-local-mongoose');

// User Schema
let UserSchema = mongoose.Schema({

    name: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        // required: true,
    },
    username: {
        type: String,
        // required: true
    },
    password: {
        type: String,
        // required: true
    },
    admin: {
        type: Number
    },
    googleId: String

});

UserSchema.plugin(findOrCreate);
UserSchema.plugin(passportLocalMongoose);

let User = module.exports = mongoose.model('User', UserSchema);