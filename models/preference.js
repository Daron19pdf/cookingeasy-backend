const mongoose = require('mongoose');

//Sous document Foyer//
const foyerSchema = mongoose.Schema({
nombrePersonne: Number,
nombreRecette: Number,
token: String,
});

//Sous document Equipement//
const equipementSchema = mongoose.Schema({
four: Boolean,
mixeur: Boolean,
plaque : Boolean,
friteuse: Boolean,
robot: Boolean,
microondes: Boolean,
token: String,
});

//Sous document Régime alimentaire//
const regimeSchema = mongoose.Schema({
vegetarien: Boolean,
vegetalien: Boolean,
pescetarien: Boolean,
gluten: Boolean,
porc: Boolean, 
alcool: Boolean,
lactose: Boolean, 
sansRegimeParticulier : Boolean,
token: String,
});

//Sous document Aliment à exclure//
const alimentExcluSchema = mongoose.Schema({
exclus: String,
token: String,
});

const thisWeekSchema = mongoose.Schema({
    duration: Number,
    difficulty: Number,
    token: String,
    });

//Collection sous doc Préférence//
const preferenceSchema = mongoose.Schema({
//Collection sous doc Foyer//
foyer: foyerSchema,
//Collection sous doc Equipement//
equipement : equipementSchema,
//Collection sous doc Régime alimentaire//
regime : regimeSchema,
//Collection sous doc Aliment à exclure//
alimentExclu : alimentExcluSchema,
// Collection sous document - this Week (difficulté + durée)
thisWeek : thisWeekSchema,
});

const Preference = mongoose.model('preference', preferenceSchema);

module.exports = Preference;