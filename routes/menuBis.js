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

//Cette variable sert à stocker le nombre d'appels à la fonction best_recettes_set.
var nb_calls = 0;

// fonction recursive qui prend en entrée: une liste de recettes (cur_recettesList), un ensemble d'ingrédients (cur_ingredientSet) et le nombre de recettes à ajouter (nb_recettes_to_add).

function best_recettes_set(cur_recettesList, cur_ingredientSet, nb_recettes_to_add) {
  nb_calls += 1;

  if (nb_recettes_to_add == 0) {
    return [cur_ingredientSet.size, []];
  }

  let best = [Infinity, []];
  for (let i = 0; i < cur_recettesList.length - nb_recettes_to_add + 1; i++) {
    const new_recettesList = cur_recettesList.slice(i + 1);
    const new_ingredientSet = union(cur_ingredientSet, cur_recettesList[i].ingredients);

    const ret = best_recettes_set(new_recettesList, new_ingredientSet, nb_recettes_to_add - 1);

    if (ret[0] < best[0]) {
      best[0] = ret[0];
      best[1] = [cur_recettesList[i].element].concat(ret[1]);
    }
  }

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

          console.log("nb_calls", nb_calls);

          // const ingredientsList = recettes.map((recette) => recette.ingredients.map((ingredient) => ingredient.name));

          // // boucle imbriquée pour comparer chaque paire de recettes et stocker le nombre d'ingrédients communs entre chaque paire dans un tableau
          // const similarities = [];
          // for (let i = 0; i < ingredientsList.length; i++) {
          //   for (let j = i + 1; j < ingredientsList.length; j++) {
          //     const commonIngredients = ingredientsList[i].filter((ingredient) =>
          //       ingredientsList[j].includes(ingredient)
          //     );
          //     similarities.push({
          //       recette1: recettes[i]._id,
          //       recette2: recettes[j]._id,
          //       similarity: commonIngredients.length,
          //     });
          //   }
          // }

          // // trier les recettes en fonction du nombre d'ingrédients communs
          // similarities.sort((a, b) => b.similarity - a.similarity);

          // // récupérer les 5 recettes avec le plus d'ingrédients communs
          // const top5Recettes = [];
          // for (let i = 0; i < 5; i++) {
          //   const recette1 = recettes.find((recette) => recette._id.equals(similarities[i].recette1));
          //   const recette2 = recettes.find((recette) => recette._id.equals(similarities[i].recette2));
          //   top5Recettes.push({
          //     recette1: recette1,
          //     recette2: recette2,
          //     similarity: similarities[i].similarity,
          //   });
          // }

          // res.json({ result: true, recettes: top5Recettes });
        })
        .catch((error) => {
          console.error(error);
          res.json({
            result: false,
            error: "Erreur lors de la recherche dyares recettes.",
          });
        });

      //   .populate(userPreferences.ingredients.name) // récupère les données de la collection Ingredient associée à chaque recette
      //     .then((recettes) => {
      //       // tableau qui va stocker les ingrédients de chaque recette

      //     })
      //     .catch((error) => {
      //       console.error(error);
      //       res.json({
      //         result: false,
      //         error: "Erreur lors de la recherche des recettes.",
      //       });
      //     });

      //   }
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

//ct sortir de mongoose et avoir un tb avec les recettes selectionnées pour pouvoir chercher en javascript pur

// .populate(userPreferences.ingredients.name) // récupère les données de la collection Ingredient associée à chaque recette
//   .then((recettes) => {
//     // tableau qui va stocker les ingrédients de chaque recette
//     const ingredientsList = recettes.map((recette) => recette.ingredients.map((ingredient) => ingredient.name));

//     // boucle imbriquée pour comparer chaque paire de recettes et stocker le nombre d'ingrédients communs entre chaque paire dans un tableau
//     const similarities = [];
//     for (let i = 0; i < ingredientsList.length; i++) {
//       for (let j = i + 1; j < ingredientsList.length; j++) {
//         const commonIngredients = ingredientsList[i].filter((ingredient) => ingredientsList[j].includes(ingredient));
//         similarities.push({ recette1: recettes[i]._id, recette2: recettes[j]._id, similarity: commonIngredients.length });
//       }
//     }

//     // trier les recettes en fonction du nombre d'ingrédients communs
//     similarities.sort((a, b) => b.similarity - a.similarity);

//     // récupérer les 5 recettes avec le plus d'ingrédients communs
//     const top5Recettes = [];
//     for (let i = 0; i < 5; i++) {
//       const recette1 = recettes.find((recette) => recette._id.equals(similarities[i].recette1));
//       const recette2 = recettes.find((recette) => recette._id.equals(similarities[i].recette2));
//       top5Recettes.push({ recette1: recette1, recette2: recette2, similarity: similarities[i].similarity });
//     }

//     res.json({ result: true, recettes: top5Recettes });
//   })
//   .catch((error) => {
//     console.error(error);
//     res.json({
//       result: false,
//       error: "Erreur lors de la recherche des recettes.",
//     });
//   });

// }
