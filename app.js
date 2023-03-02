require('dotenv').config();
require('./models/connection');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const fetch = require('node-fetch');

var indexRouter = require('./routes/index');
var UserRouter = require('./routes/user');
var PreferencesRouter = require('./routes/preferences');
var MenuRouter = require('./routes/menu');

var app = express();

const cors = require('cors');
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', indexRouter);
app.use('/user', UserRouter);
app.use('/preferences', PreferencesRouter);
app.use('/menu', MenuRouter);

module.exports = app;
