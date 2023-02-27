const mongoose = require('mongoose');

//collection user//
const userSchema = mongoose.Schema({
	
pseudo : String,
nom: String,
prénom: String,
password : String,
email: String,
token: String,
//import clé étrangère préférence//
preference : {type: mongoose.Schema.Types.ObjectId, ref: 'preference'}
});

const User = mongoose.model('user', userSchema);

module.exports = User;