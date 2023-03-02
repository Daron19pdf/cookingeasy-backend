var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/users");
const Preference = require("../models/preference");
const uid2 = require("uid2");
const fetch = require('node-fetch')

router.get("/preference", (req, res) => {
    const { vegetarien,vegan,pescetarien,gluten,porc,alcool,lactose,sansRegimeParticulier, token } = req.body;
    User.findOne({ token: token }).then(async (user) => {
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






  
  


  module.exports = router;