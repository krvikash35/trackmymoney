module.exports = {

  // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
  "runEnv": process.env.runEnv || "prod", // prod or dev
  "prodUrl":{
    // "dbUrl" : "mongodb://krvikash35:1234@ds053784.mongolab.com:53784/mymongodb",
    "dbUrl" : process.env.OPENSHIFT_MONGODB_DB_URL+ process.env.OPENSHIFT_APP_NAME || "mongodb://krvikash35:1234@ds053784.mongolab.com:53784/mymongodb",
    // "dbUrl" : "mongodb://admin:EYKIDAcx1Vpg@5666059f2d527187a7000029-buggycoder.rhcloud.com:51961/",
    "appUrl": process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    "appPort": process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || "8080"
  },
  "devUrl":{
    "dbUrl" : "mongodb://localhost/trackourmoney",
    "appUrl": "0.0.0.0",
    "appPort": "8080"
  },
  "serverSecret": "ILoveCoding",
  "mailSerUser": "vikash@trackourmoney.com",
  "mailSerUserPwd": "newYear2016",
  "emailVerSubject": "verify your email to use on trackourmoney",
  "emailverText": "Please find below the 4 digit verification code and enter it while signup",
  "emailPwdSubject": "Forgot password of your trackourmoney account",
  "emailPwdText": "Please find below the password, you should chagne your password on nex login at your convenience",
  "tokenExpiresInSecond": 3600,
  "errMsg" : {
    "invalidRunEvn": "Please enter the valid value for run environment"

  },
  "trxType":            ["Income", "Expense", "Transfer"],
  "accountLoginMethod": ["email","phone"],
  "moneyAccountType":   ["SavingAccount", "CreditCard","DigitalWallet","CashAccount"],
  "initIncomeSource":   ["Salary", "Dividend", "Interest-Principal", "Borrow", "Gift", "Refund"],
  "initExpenseSource":  ["Fooding", "DailyUsageItem", "On Family", "Travel", "Entertainment",
                          "Health", "prepaid-postpaid-DTH", "Bil-Water-Electric", "paid-EMI",
                          "Rent-Office-PG", "wages", "paid-Tax"],
  "initMoneyAccount":   [
    {"name": "ICICI",    "type": "SavingAccount" },
    {"name": "Others",   "type": "SavingAccount" },
    {"name": "ICICI",    "type": "CreditCard" },
    {"name": "Others",   "type": "CreditCard"},
    {"name": "Paytm",    "type": "DigitalWallet"},
    {"name": "Mobikwik", "type": "DigitalWallet"},
    {"name": "Others",   "type": "DigitalWallet"},
    {"name": "Cash",     "type": "CashAccount"}
  ]
};
