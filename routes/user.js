var express = require("express");
var router = express.Router();
const mongoose = require("mongoose");
const User = require("../models/users");
const Preference = require("../models/preference");
const uid2 = require("uid2");
const { checkBody } = require("../modules/checkBody");
const fetch = require("node-fetch");
const bcrypt = require("bcrypt");

router.post("/signup", (req, res) => {
  if (!checkBody(req.body, ["pseudo", "nom", "prenom", "password", "email"])) {
    res.json({ result: false, error: "Tous les champs doivent être remplis" });
    return;
  }
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(req.body.email)) {
    res.json({ result: false, error: "Le format de l'email est invalide" });
    return;
  }

  User.findOne({ email: req.body.email }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
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
          editor: { type: mongoose.Schema.Types.ObjectId, ref: "editors" },
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

router.post("/signin", (req, res) => {
  if (!checkBody(req.body, ["pseudo", "password"])) {
    res.json({ result: false, error: "Tous les champs doivent être remplis" });
    return;
  }

  User.findOne({ pseudo: req.body.pseudo }).then((data) => {
    console.log(data);
    if (data && bcrypt.compareSync(req.body.password, data.password)) {
      res.json({
        result: true,
        nom: data.nom,
        prenom: data.prenom,
        email: data.email,
        token: data.token,
        preference: data.preference,
      });
    } else {
      res.json({
        result: false,
        error: "Utilisateur inexistant ou mot de passe incorrect",
      });
    }
  });
});

router.delete('/:token', async (req, res) => {
  try {
    // Find the user by token and populate their preference
    const user = await User.findOne({ token: req.params.token }).populate('preference');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur inexistant' });
    }
    // Delete the user's preference
    await Preference.findByIdAndDelete(user.preference._id);
    // Delete the user
    await User.deleteOne({ _id: user._id });
    res.json({ message: "L'utilisateur et ses préférences ont bien été supprimés." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

router.get("/:token", (req, res) => {
  User.findOne({ token: req.query.token })
    .populate("preference")
    .then((data) => {
      if (data) {
        res.json({
          result: true,
          data 
        });
      } else {
        res.json({ result: false, error: "Utilisateur inexistant" });
      }
    });
});

router.post("/update", (req, res) => {
  if (!checkBody(req.body, ["pseudo", "nom", "prenom", "password", "email"])) {
    res.json({ result: false, error: "Tous les champs doivent être remplis" });
    return;
  }
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (!emailRegex.test(req.body.email)) {
    res.json({ result: false, error: "Le format de l'email est invalide" });
    return;
  }

  User.findOne({ email: req.body.token }).then((data) => {
    if (data === null) {
      const hash = bcrypt.hashSync(req.body.password, 10);
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
          editor: { type: mongoose.Schema.Types.ObjectId, ref: "editors" },
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
