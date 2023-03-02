var express = require("express");
var router = express.Router();
const Preference = require("../models/preference");
const fetch = require('node-fetch')
const Recipe = require("../models/recette");

// Route GET qui récupère les préférences d'un utilisateur dans la collection preferences en utilisant son ID preference (et non son ID utilisateur...)
router.get("/preferences/:id", (req, res) => {
  const userId = req.params.id;
  Preference.findOne({ _id: userId }).then((userPreferences) => {
    if (userPreferences) {
      res.json({ result: true, preferences: userPreferences });
    } else {
      res.json({ result: false, error: "Utilisateur inexistant." });
    }
  });
});





router.get("/recettes", (req, res) => {
  const userId = req.query.userId;

  // On récupère les préférences de l'utilisateur
  Preference.findOne({ _id: userId }).then((userPreferences) => {
    if (!userPreferences) {
      return res.json({ result: false, error: "Utilisateur inexistant." });
    }

    // On construit le critère de recherche pour les recettes en fonction des préférences de l'utilisateur
    const searchCriteria = {};

    if (userPreferences.equipement.robot) {
      searchCriteria["appliance_tags"] = "robot";
    }

    if (userPreferences.regime.vegetarien) {
      searchCriteria["diet_tags"] = "végétarien";
    }

    // On lance la recherche
    Recipe.find(searchCriteria).then((recipes) => {
      res.json({ result: true, recipes });
    }).catch((error) => {
      console.error(error);
      res.json({ result: false, error: "Erreur lors de la recherche des recettes." });
    });
  }).catch((error) => {
    console.error(error);
    res.json({ result: false, error: "Erreur lors de la récupération des préférences de l'utilisateur." });
  });
});


  module.exports = router;