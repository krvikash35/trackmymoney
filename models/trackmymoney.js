var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var sConfig      = require('../config');

// user schema, will map to user_info collection
var userInfoSchema = new schema({
  "account":  {
      "email":                { type: String, maxlength: 25, required: true, lowercase: true, unique: true, index: true },
      "phone":                { type: Number, maxlength: 12, minlength: 12},
      "fullname":             { type: String, maxlength: 25},
      "password":             { type: String, required: true},
      "accountVerified": [{
          "method":           { type: String, enum: sConfig.accountLoginMethod },
          "isVerified":       { type: Boolean }
      }],
      "creatDate":            { type: Date },
      "updateDate":           { type: Date, default: Date.now }
  },
  "sourceOfMoneyTrx": {
      "incomeSource":         [{"name": {type: String, maxlength: 25, minlength: 3}}],
      "expenseSource":        [{"name": {type: String, maxlength: 25, minlength: 3}}]
  },
  "moneyAccount": [{
      "name":                 { type: String, maxlength: 15},
      "type":                 { type: String, enum: sConfig.moneyAccountType}
  }]
});



// user personal transaction schema, will map to user_prsnl_trx collection
var userPrsnlTrxSchema = new schema({
  "amount":       { type: Number, required: true},
  "type":         { type: String, enum: sConfig.trxType},
  "source":       { type: String },
  "destination":  { type: String},
  "description":  { type: String},
  "userId":    { type: String},
  "date":         { type: Date, default: Date.now }
});


//database containing all the schema
var trackmymoneydb = {
  "userInfoDoc":      mongoose.model("userInfo",userInfoSchema),
  "userPrsnlTrxDoc":  mongoose.model("userPrsnlTrx",userPrsnlTrxSchema)
}


//export this module so that other pages can use
module.exports=trackmymoneydb;
