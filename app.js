var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req,res,next){
	res.sendFile(__dirname + "/index.html");
});

module.exports = app;