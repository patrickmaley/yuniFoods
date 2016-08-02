// app/models/user.js
// load the things we need
var mongoose = require('mongoose');

// define the schema for our user model
var userSchema = mongoose.Schema({
    local            : {
    	title		: String,
        entry     	: String,
        image		: [{
        	name    : String
        }],
        date		: String
    },
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Entry', userSchema);