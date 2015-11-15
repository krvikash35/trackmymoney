var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var sConfig      = require('../config');

// user schema, will map to user_info collection
var userInfoSchema = new schema({
  "account":  {
      "email":                { type: String, maxlength: 25, required: true, lowercase: true, unique: true, index: true, match: sConfig.emailRegex },
      "phone":                { type: Number, maxlength: 12},
      "fullname":             { type: String, maxlength: 25},
      "password":             { type: String, maxlength: 25, required: true},
      "accountVerified": [{
          "method":           { type: String, enum: sConfig.accountLoginMethod },
          "isVerified":       { type: Boolean }
      }],
      "creatDate":            { type: Date, default: Date.now },
      "updateDate":           { type: Date, default: Date.now }
  },
  "sourceOfMoneyTrx": {
      "incomeSource":         { type: [String], maxlength: 25, minlength: 3},
      "expenseSource":        { type: [String], maxlength: 25, minlength: 3 }
  },
  "accountBalance":  {
      "allAccountBalance":    { type: Number, default: 0 },
      "savingAccountBalance": { type: Number, default: 0 },
      "creditAccountBalance": { type: Number, default: 0 },
      "walletAccountBalance": { type: Number, default: 0 },
      "cashAccountBalance":   { type: Number, default: 0 },
  },
  "moneyAccount": [{
      "name":                 { type: String, unique: true, match:sConfig.moneyAccountNameRegex , maxlength: 25},
      "type":                 { type: String, enum: sConfig.moneyAccountType},
      "subAccountBalance":    { type: Number, default: 0 }
  }]
});





// user personal transaction schema, will map to user_prsnl_trx collection
var userPrsnlTrxSchema = new schema({

});


//database containing all the schema
var trackmymoneydb = {
  "userInfoDoc":      mongoose.model("userInfoModels",userInfoSchema),
  "userPrsnlTrxDoc":  mongoose.model("",userPrsnlTrxSchema)
}


//export this module so that other pages can use
module.exports=trackmymoneydb;
