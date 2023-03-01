var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/users");
const Preference = require("../models/preference");
const uid2 = require("uid2");
const { checkBody } = require("../modules/checkBody");
const fetch = require('node-fetch')
const bcrypt = require('bcrypt');

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["pseudo", "nom", "prenom", "password", "email"])) {
    res.json({ result: false, error: "Tous les champs doivent être remplis" });
    return;
  }
  const hash = bcrypt.hashSync('password', 10);
  User.findOne({ email: req.body.email }).then((data) => {
    //const token = uid2(32);
    if (data === null) {
      const newPref = new Preference({});

      newPref.save().then((newPref) => {
        const newUser = new User({
          pseudo: req.body.pseudo,
          nom: req.body.nom,
          prenom: req.body.prenom,
          password: hash,
          email: req.body.email,
          token: uid2(32),
          preference: newPref._id,
          editor: { type: mongoose.Schema.Types.ObjectId, ref: 'editors' },
        });

        newUser.save().then((data) => {
          console.log(data);
          res.json({ result: true, token: data.token });
        });
      });
    } else {
      res.json({ result: false, error: "L'utilisateur existe déjà." });
    }
  });
});

module.exports = router;
