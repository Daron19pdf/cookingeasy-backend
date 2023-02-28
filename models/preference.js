const mongoose = require('mongoose');

//Sous document Foyer//
const foyerSchema = mongoose.Schema({
nombrePersonne: Number,
nombreRecette: Number,
});

//Sous document Equipement//
const equipementSchema = mongoose.Schema({
four: Boolean,
mixeur: Boolean,
plaque : Boolean,
friteuse: Boolean,
robot: Boolean,
});

//Sous document Régime alimentaire//
const regimeSchema = mongoose.Schema({
vegetarien: Boolean,
vegan: Boolean,
pescetarien: Boolean,
gluten: Boolean,
porc: Boolean, 
alcool: Boolean,
lactose: Boolean, 
sansRegimeParticulier : Boolean,
});

//Sous document Aliment à exclure//
const alimentExcluSchema = mongoose.Schema({
exclus: String,
});

//Collection Préférence//
const preferenceSchema = mongoose.Schema({

foyer: foyerSchema,
equipement : equipementSchema,
regime : regimeSchema,
alimentExclu : alimentExcluSchema,
});

const Preference = mongoose.model('preference', preferenceSchema);

module.exports = Preference;