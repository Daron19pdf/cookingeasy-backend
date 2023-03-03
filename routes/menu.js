var express = require("express");
var router = express.Router();
const Preference = require("../models/preference");
const fetch = require("node-fetch");
const Recette = require("../models/recette");

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

// Route GET qui récupère les préférences d'un utilisateur dans la collection preferences en utilisant son ID preference (et non son ID utilisateur...)
router.get("/recettes", (req, res) => {
  const userId = req.query.userId;
  // On récupère les préférences de l'utilisateur
  Preference.findOne({ _id: userId })
    .then((userPreferences) => {
      if (!userPreferences) {
        return res.json({ result: false, error: "Utilisateur inexistant." });
      }

      // On construit le critère de recherche pour les recettes en fonction des préférences de l'utilisateur
      const searchCriteria = {};

      //pref/equipement
      searchCriteria["appliance_tags"] = [];
      if (userPreferences.equipement.four) {
        searchCriteria["appliance_tags"].push("four");
      }
      if (userPreferences.equipement.mixeur) {
        searchCriteria["appliance_tags"].push("mixeur");
      }
      if (userPreferences.equipement.plaque) {
        searchCriteria["appliance_tags"].push("plaques de cuisson");
      }
      if (userPreferences.equipement.friteuse) {
        searchCriteria["appliance_tags"].push("friteuse");
      }
      if (userPreferences.equipement.robot) {
        searchCriteria["appliance_tags"].push("robot");
      }
      if (userPreferences.equipement.microondes) {
        searchCriteria["appliance_tags"].push("micro ondes");
      }

      //pref/Régime alimentaire
      searchCriteria["diet_tags"] = [];
      if (userPreferences.regime.vegetarien) {
        searchCriteria["diet_tags"].push("végétarien");
      }
      if (userPreferences.regime.vegetalien) {
        searchCriteria["diet_tags"].push("végétalien");
      }
      if (userPreferences.regime.pescetarien) {
        searchCriteria["diet_tags"].push("pescetarien");
      }
      if (userPreferences.regime.gluten) {
        searchCriteria["diet_tags"].push("sans gluten");
      }
      if (userPreferences.regime.porc) {
        searchCriteria["diet_tags"].push("sans porc");
      }
      if (userPreferences.regime.alcool) {
        searchCriteria["diet_tags"].push("sans alcool");
      }
      if (userPreferences.regime.lactose) {
        searchCriteria["diet_tags"].push("sans lactose");
      }
      if (userPreferences.regime.sansRegimeParticulier) {
        searchCriteria["diet_tags"].push("sans regime particulier");
      }

      //pref/difficulté et temps => voir avec sarah car je ne les trouve pas dans la base de données (penser à prendre valeur inferieur avec des lessthan)
      // https://www.mongodb.com/docs/manual/reference/operator/query/lte/
      // On lance la recherche des recettes correspondant aux critères
      Recette.find({
        appliance_tags: {
          $not: { $elemMatch: { $nin: searchCriteria["appliance_tags"] } },
        },
        diet_tags: { $all: searchCriteria["diet_tags"] },
        // difficulty: { $lte: userPreferences.difficulte },
        // duration: { $lte: userPreferences.temps },
      })
        .then((recettes) => {
          // const recetteNames = recettes.map((recette) => recette.title);
          const recetteNames = recettes.map((recette) => {
            return {
              title: recette.title,
              id: recette._id,
              photo: recette.photo,
            };
          });
          res.json({ result: true, recettes: recetteNames });
        })
        .catch((error) => {
          console.error(error);
          res.json({
            result: false,
            error: "Erreur lors de la recherche dyares recettes.",
          });
        });
    })
    .catch((error) => {
      console.error(error);
      res.json({
        result: false,
        error:
          "Erreur lors de la récupération des préférences de l'utilisateur.",
      });
    });
});

module.exports = router;

//ct sortir de mongoose et avoir un tb avec les recettes selectionnées pour pouvoir chercher en javascript pur
