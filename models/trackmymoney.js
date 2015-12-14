var mongoose     = require('mongoose');
var schema       = mongoose.Schema;


//User Account Schema
var usrAcct = new schema({
  "account":  {
      "email":                { type: String, required: true, index: true, unique: true },
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

//User Temporary model where user account verification details stored
var usrVerTemp = new schema({
  "email":    {type: String},
  "verCode":  {type: Number},
  "verStatus": {type: Number, default: 0}
})

//User individual transaction schema
var usrPrsTrx = new schema({
  "amount":       { type: Number},
  "type":         { type: String },
  "source":       { type: String },
  "destination":  { type: String},
  "description":  { type: String},
  "userId":       { type: String},
  "date":         { type: Date, default: Date.now }
});

//Server related init value
var serverInfo = new schema({
  "serverSecret": {type: String},
  "mailSerUserPwd": {type: String}
})

//User group shcema
var userGroup = new schema({
  "grName":           {type: String},
  "grAdmin":          {type: String},
  "grCreateDate":     {type: Date },
  "grUpdateDate":     {type: Date, default: Date.now},
  "grMember": [{
    "grMemName": {type: String},
    "grMemEmail": {type: String}
  }]
})

//User group trx schema
var userGroupTrx = new schema({
  "grId":           {type: String},
  "gtAmount":       {type: Number},
  "gtInitiator":    {type: String},
  "gtDate":         {type: Date, default: Date.now},
  "gtMem":  [{
    "gtMemId":      {type: String},
    "gtMemAmount":  {type: Number}
  }],
  "gtItem": {type: String},
  "gtDesc": {type: String}
})

//User notification schema
var userNoti = new schema({
  "notiSubject" : {type: String},
  "notiText" :    {type: String},
  "notiDate" :    {type: String},
  "notiUser" :    {type: String},
  "notiType" :    {type: String}, //read, acceptGrMem, delGrTrx
  "notiParam":    [{
    "pName":  {type: String},
    "pValue": {type: String}
  }]
})

//database containing all the schema
var tmcdb = {
  "usrAccts":         mongoose.model("usrAccts",usrAcct),
  "usrPrsTrxs":       mongoose.model("usrPrsTrxs",usrPrsTrx),
  "usrVerTemps":      mongoose.model("usrVerTemps",usrVerTemp),
  "serverInfo":       mongoose.model('serverInfo', serverInfo),
  "userNoti":         mongoose.model('userNotis', userNoti),
  "userGroup":        mongoose.model('userGroup', userGroup),
  "userGroupTrx":     mongoose.model('userGroupTrx', userGroupTrx)

}


//export this module so that other pages can use
module.exports=tmcdb;
