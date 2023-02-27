const mongoose = require('mongoose');

//collection recette//
const recetteSchema = mongoose.Schema({
	
    photo:String, 
    nom: String,
    tempsPreparation: Number,
    tempsCuisson: Number,
    tempsTotal: Number, 
    dificulté: Number, 
    nombrePersonne: Number,
    equipement:String,
    ingrédients: String,
    quantité: String,
    nomIngrédients: String,
    tags: String,
    step1: String,
    step2: String,
    step3: String,
    step4: String,
    conservation: String,
});

const Recette = mongoose.model('recette', recetteSchema);

module.exports = Recette;