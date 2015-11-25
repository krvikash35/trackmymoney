var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var sConfig      = require('../config/config');

// User Account Schema
var usrAcct = new schema({
  "account":  {
      "email":                { type: String,index: true },
      "phone":                { type: Number},
      "fullName":             { type: String},
      "password":             { type: String},
      "creatDate":            { type: Date },
      "updateDate":           { type: Date, default: Date.now }
  },
  "sourceOfMoneyTrx": {
      "incomeSource":         [{type: String}],
      "expenseSource":        [{type: String}]
  },
  "moneyAccount": [{
      "name":                 { type: String},
      "type":                 { type: String}
  }]
});

// User Temporary model where user account verification details stored
var usrVerTemp = new schema({
  "email":    {type: String},
  "verCode":  {type: Number}
})

// User individual transaction schema
var usrPrsTrx = new schema({
  "amount":       { type: Number, required: true},
  "type":         { type: String, enum: sConfig.trxType},
  "source":       { type: String },
  "destination":  { type: String},
  "description":  { type: String},
  "usrId":       { type: String},
  "date":         { type: Date, default: Date.now }
});


//database containing all the schema
var tmcdb = {
  "usrAcct":    mongoose.model("usrAcct",usrAcct),
  "usrPrsTrx":  mongoose.model("usrPrsTrx",usrPrsTrx),
  "usrVerTemp": mongoose.model("usrVerTemp",usrVerTemp)
}


//export this module so that other pages can use
module.exports=tmcdb;
