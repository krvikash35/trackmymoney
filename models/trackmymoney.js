var mongoose     = require('mongoose');
var schema       = mongoose.Schema;

// User Account Schema
var usrAcct = new schema({
  "account":  {
      "email":                { type: String, index: true, unique: true },
      "phone":                { type: Number},
      "fullname":             { type: String},
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
  "email":    {type: String, index: true},
  "verCode":  {type: Number},
  "verStatus": {type: Number, default: 0}
})

// User individual transaction schema
var usrPrsTrx = new schema({
  "amount":       { type: Number, required: true},
  "type":         { type: String },
  "source":       { type: String },
  "destination":  { type: String},
  "description":  { type: String},
  "userId":       { type: String},
  "date":         { type: Date, default: Date.now }
});

var serverInfo = new schema({
  "serverSecret": {type: String},
  "mailSerUserPwd": {type: String}
})

//database containing all the schema
var tmcdb = {
  "usrAccts":    mongoose.model("usrAccts",usrAcct),
  "usrPrsTrxs":  mongoose.model("usrPrsTrxs",usrPrsTrx),
  "usrVerTemps": mongoose.model("usrVerTemps",usrVerTemp),
  "serverInfo": mongoose.model('serverInfo', serverInfo)
}


//export this module so that other pages can use
module.exports=tmcdb;
