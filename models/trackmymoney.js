var mongoose     = require('mongoose');
var schema       = mongoose.Schema;
var sConfig      = require('../config')

// user schema, will map to user_info collection
var userInfo = new schema({
  "account":  {
      "email":                { type: String, maxlength: 25, required: true, unique: true, index: true, match: sConfig.emailRegex },
      "phone":                { type: Number, maxlength: 12 },
      "name":                 { type: String, maxlength: 25},
      "password":             { type: String, maxlength: 25 },
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





// user personal transaction schema, will map to this collection
var userPersonalTrx = new schema({

});
