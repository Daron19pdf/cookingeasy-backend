var express = require('express');
var router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/users');


//ici juste pour tester si ça marche//
router.get('/user', function(req, res) {
    res.send('respond with a resource')
    console.log("hello");;
});



module.exports = router;
