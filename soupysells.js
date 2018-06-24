// JavaScript source code
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const apiController = require('./controllers/apiController');
const config = require('./config.js');

const app = express();
const urlencodedParser = bodyParser.urlencoded({ extended: false });

apiController(app);

app.set('view engine', 'ejs')
app.use('/assets', express.static(__dirname + '/public'));

app.listen(config.app.port);
