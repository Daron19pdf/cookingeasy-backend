const mongoose = require('mongoose');

//Sous document Foyer//
const foyerSchema = mongoose.Schema({
nombrePersonne: Number,
nombreRecette: Number,
Token: String,
});

//Sous document Equipement//
const equipementSchema = mongoose.Schema({
four: Boolean,
mixeur: Boolean,
plaque : Boolean,
friteuse: Boolean,
robot: Boolean,
microondes: Boolean,
Token: String,
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
Token: String,
});

//Sous document Aliment à exclure//
const alimentExcluSchema = mongoose.Schema({
exclus: String,
Token: String,
});

//Collection Préférence//
const preferenceSchema = mongoose.Schema({
//Collection Foyer//
foyer: foyerSchema,
//Collection Equipement//
equipement : equipementSchema,
//Collection Régime alimentaire//
regime : regimeSchema,
//Collection Aliment à exclure//
alimentExclu : alimentExcluSchema,
});

const Preference = mongoose.model('preference', preferenceSchema);

module.exports = Preference;