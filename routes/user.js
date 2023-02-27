var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/users');
const uid2 = require('uid2');
const { checkBody } = require("../modules/checkBody");

router.post('/signup', (req, res) => {
	if (!checkBody(req.body, ["pseudo", "nom", "prenom", "password", "email"])) {
        res.json( { result: false, error: "Tous les champs doivent être remplis" });
        return
    }
    User.findOne({ email: req.body.email }).then(data => {
        const token = uid2(32);
        if (data === null) {
            const newUser = new User ({
                pseudo: req.body.pseudo,
                nom: req.body.nom,
                prenom: req.body.prenom,
                password: req.body.password,
                email: req.body.email,
                token: token,
            })
            newUser.save().then(() => {
                res.json({ result: true });
            });
        } else {
            res.json({ result: false, error: "L'utilisateur existe déjà."})
        }
    }) 
});
module.exports = router;
