'use strict';

var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var dns = require('dns');

var cors = require('cors');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/ 
// mongoose.connect(process.env.DB_URI);
mongoose.connect(process.env.MONGO_URI, {useNewUrlParser: true, useUnifiedTopology: true});

app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

const Schema = mongoose.Schema;
var urlSchema = new Schema ({
  original_url: {type: String, required: true}
});

var urlModel = mongoose.model('urlModel', urlSchema);

app.post('/api/shorturl/new', function (req, res){
  var url = new urlModel({original_url: req.body.url});
  var urlSplitted = url.original_url.split('.');
  var urlDomain = urlSplitted.slice(1).join('.');
  if (urlSplitted[0] == 'http://www' | urlSplitted[0] == 'https://www') {
    dns.lookup(urlDomain, function(err, address, family){
      if (err) {
        res.json({"error": "invalid URL"});
      } else {
        url.save(function(err){
          if (err) console.error(err);
        }); 
        res.json({"original_url": url.original_url, "short url": url._id});
      }
    });  
  } else {
    res.json({"error": "invalid URL"});
  }
  console.log(url.original_url);
});

app.get('/api/shorturl/:identifier', function(req, res) {
  urlModel.findOne({_id: req.params.identifier}, function (err, data) {
    if (err) return res.json({"error": "invalid URL"});
    res.redirect(data.original_url);
  });
});

app.listen(port, function () {
  console.log('Node.js listening ...');
});