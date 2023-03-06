var express = require("express");
var router = express.Router();
const Preference = require("../models/preference");
const fetch = require("node-fetch");
const Recette = require("../models/recette");

var ObjectId = require("mongoose").Types.ObjectId;

router.get("/miseenoeuvre", (req, res) => {
  //dans la query on a des strings alors on transforme en array javascript
  const recettesList = JSON.parse(req.query.recettesList);

  //   const recettesList = ["6400695575be5e84602a3ff8"];
  //   Recette.find({ _id: { $in: recettesList } }).then((recettes) => {
  //   Recette.find({ _id: { $in: recettesList.map((e) => ObjectId(e)) } }).then((recettes) => {
  Recette.find({ title: { $in: recettesList } }).then((recettes) => {
    let steps = {
      prep: [],
      cuisson: [],
      assemblage: [],
      cuisson_finale: [],
      remise_en_oeuvre: [],
    };

    recettes.forEach((recette) => {
      recette.steps.forEach((step) => {
        steps[step.stage].push({
          recette_id: recette._id,
          recette_title: recette.title,
          step: step,
        });
      });
    });

    res.json({ steps: steps });
  });
});

module.exports = router;
