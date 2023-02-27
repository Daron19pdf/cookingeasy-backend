const mongoose = require('mongoose');

//collection course//
const courseSchema = mongoose.Schema({
	
categorie : String,
recette : {type: mongoose.Schema.Types.ObjectId, ref: 'recette'}

});

const Course = mongoose.model('course', courseSchema);

module.exports = Course;