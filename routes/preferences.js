var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/users");
const Preference = require("../models/preference");
const uid2 = require("uid2");
const { checkBody } = require("../modules/checkBody");

router.post("/equipement", (req, res) => {
    const { four, mixeur, plaque, friteuse, robot, microondes, token } = req.body;
    User.findOne({ token: token }).then(async (user) => {
      if (user) {
        const preferenceUser = await Preference.findById(user.preference);
        console.log(preferenceUser);
          preferenceUser.equipement = {
            four: four,
            mixeur: mixeur,
            plaque: plaque,
            friteuse: friteuse,
            robot: robot,
            microondes: microondes,
            token: token,
          };
          preferenceUser.save().then(() => {
            res.json({ result: true });
          });
      } else {
        res.json({ result: false, error: "Utilisateur inexistant." });
      }
    });
  });

  router.post("/alimentexclus", (req, res) => {
    const { exclus, token } = req.body;
    User.findOne({ Token: token }).then(async (user) => {
      if (user) {
        const preferenceUser = await Preference.findById(user.preference);
        console.log(preferenceUser);
          preferenceUser.alimentExclu = {
            exclus: exclus,
            Token: token,
          };
          preferenceUser.save().then(() => {
            res.json({ result: true });
          });
      } else {
        res.json({ result: false, error: "Utilisateur inexistant." });
      }
    });

  });

  router.post("/foyer", (req, res) => {
    const { nombrePersonne,nombreRecette, token } = req.body;
    User.findOne({ Token: token }).then(async (user) => {
      if (user) {
        const preferenceUser = await Preference.findById(user.preference);
          preferenceUser.foyer = {
            nombrePersonne: nombrePersonne,
            nombreRecette: nombreRecette,
            Token: token,
          };
          preferenceUser.save().then(() => {
            res.json({ result: true });
          });
      } else {
        res.json({ result: false, error: "Utilisateur inexistant." });
      }
    });

  });

  router.post("/regime", (req, res) => {
    const { vegetarien,vegan,pescetarien,gluten,porc,alcool,lactose,sansRegimeParticulier, token } = req.body;
    User.findOne({ Token: token }).then(async (user) => {
      if (user) {
        const preferenceUser = await Preference.findById(user.preference);
          preferenceUser.regime = {
            vegetarien: vegetarien,
            vegan: vegan,
            pescetarien: pescetarien,
            gluten: gluten,
            porc: porc, 
            alcool: alcool,
            lactose: lactose, 
            sansRegimeParticulier : sansRegimeParticulier,
            Token: token,
          };
          preferenceUser.save().then(() => {
            res.json({ result: true });
          });
      } else {
        res.json({ result: false, error: "Utilisateur inexistant." });
      }
    });

  });


  module.exports = router;