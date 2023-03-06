var express = require("express");
var router = express.Router();
const Preference = require("../models/preference");
const fetch = require("node-fetch");
const Recette = require("../models/recette");

//fonction qui prend deux ensembles (Sets) en entrée et retourne leur union sous la forme d'un nouvel ensemble.
function union(setA, setB) {
  let _union = new Set(setA);
  for (let elem of setB) {
    _union.add(elem);
  }
  return _union;
}


//FONCTION QUI RENVOIE LE NOMBRE DE RECETTES CHOISIES PAR L'UTILISATEUR QUI NECESSITENT LE + PETIT NOMBRE D'INGREDIENTS PRIMAIRES (la liste d'ingrédients..)

// fonction recursive qui prend en entrée:
//  - une liste de recettes (cur_recettesList),
//  - un ensemble d'ingrédients déjà nécessaires (cur_ingredientSet)
//  - le nombre de recettes à ajouter (nb_recettes_to_add).
// et retourne:
//  - la taille de l'ensemble d'ingrédients nécessaire y compris pour les nb_recettes_to_add recettes ajoutées
//  - la liste optimale des recettes à ajouter
function best_recettes_set(cur_recettesList, cur_ingredientSet, nb_recettes_to_add) {
  // S'il n'est plus nécessaire d'ajouter de recette, alors la recherche est terminée et la fonction renvoie:
  // un tableau contenant la taille de l'ensemble d'ingrédients courant et un tableau vide (puisque aucune recette ne doit être ajoutée).
  if (nb_recettes_to_add == 0) {
    return [cur_ingredientSet.size, []];
  }

  // Initialise la variable best, qui sera utilisée pour stocker la meilleure combinaison de recettes trouvée jusqu'à présent.
  // Infinity pour la taille de l'ensemble d'ingrédients (qui sera mis à jour lorsqu'une combinaison meilleure sera trouvée)
  // [] pour les recettes
  let best = [Infinity, []];
  //boucle qui parcourt toutes les recettes selectionnables.
  // "- nb_recettes_to_add + 1" car choisir une recette plus loin ne perttrait pas d'ajouter nb_recettes_to_add recettes
  for (let i = 0; i < cur_recettesList.length - nb_recettes_to_add + 1; i++) {
    // crée une nouvelle liste de recettes à partir de la liste courante, en excluant la recette i  
    const new_recettesList = cur_recettesList.slice(i + 1);
    // crée un nouvel ensemble d'ingrédients en unissant l'ensemble courant avec les ingrédients de la recette i
    const new_ingredientSet = union(cur_ingredientSet, cur_recettesList[i].ingredients);

    //appelle récursivement la fonction best_recettes_set avec
    // - la nouvelle liste de recettes
    // - le nouvel ensemble d'ingrédients
    // - le nombre de recettes à ajouter (donc réduit de 1)
    const ret = best_recettes_set(new_recettesList, new_ingredientSet, nb_recettes_to_add - 1);
    // cette condition vérifie si la combinaison de recettes retournée par l'appel récursif est meilleure que celle stockée dans best. 
    //  - La meilleure taille d'ensemble d'ingrédients est donc maintenant celle retournée (ret[0])
    //  - la liste de recettes pour l'obtenir est la concaténation de la recette i avec la liste retournée optimale du sous-problème (ret[1])
    if (ret[0] < best[0]) {
      best[0] = ret[0];
      best[1] = [cur_recettesList[i].element].concat(ret[1]);
    }
  }
  // la fonction retourne la meilleure combinaison de recettes
  return best;
}



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
      //https://www.mongodb.com/docs/manual/reference/operator/query/lte/
      // On lance la recherche des recettes correspondant aux critères (les recettes pour lesquelles toutes les appliances de l'utilisateur sont dans les appliances de la recette)
      //$not "pas" au moins. $elemMatch: appliance qui n'est pas dans "$nin" les appliances de l'utilisateur

      Recette.find({
        appliance_tags: {
          $not: { $elemMatch: { $nin: searchCriteria["appliance_tags"] } },
        },
        diet_tags: { $all: searchCriteria["diet_tags"] },
        difficulty: { $lte: userPreferences.thisWeek.difficulty },
        duration: { $lte: userPreferences.thisWeek.duration },
      })
        .then((recettes) => {
          const recettesList = recettes.map((recette) => {
            return {
              element: { title: recette.title, id: recette._id, photo: recette.photo },
              ingredients: new Set(
                recette.ingredients.filter((ingredient) => ingredient.is_primary).map((ingredient) => ingredient.name)
              ),
            };
          });

          const [nb_ingredients, bestRecettesList] = best_recettes_set(
            recettesList,
            new Set(),
            Math.min(userPreferences.foyer.nombreRecette, recettesList.length)
          );

          res.json({ result: true, nb_primary_ingredients: nb_ingredients, recettes: bestRecettesList });
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
        error: "Erreur lors de la récupération des préférences de l'utilisateur.",
      });
    });
});

module.exports = router;


