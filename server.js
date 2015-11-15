// /signup
// /signin
// /user/report
// /user/info

//load all the required module
var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var jwt        = require("jsonwebtoken");
var mongoose   = require("mongoose");
var User       = require('./models/trackmymoney');
var sConfig    = require('./config');





// Configure env to run this app: Development or production
console.log(sConfig.runEnv);
if(sConfig.runEnv === 'dev') {
  mongoDBUrl = sConfig.devUrl.dbUrl;
  port       = sConfig.devUrl.appPort;
} else {
  if(sConfig.runEnv === 'prod'){
    mongoDBUrl  = sConfig.prodUrl.dbUrl;
    port        = sConfig.prodUrl.appPort;
  }
  else{
    return console.log(sConfig.errMsg.invalidRunEvn);
  }
}




  //connect to mongo db
  mongoose.connect(mongoDBUrl, function(err){
    if(err){
      console.log("Could not connect to "+mongoDBUrl);
    }
  });
