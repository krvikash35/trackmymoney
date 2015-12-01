module.exports = {

  // looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
  "runEnv": process.env.runEnv || "prod", // prod or dev
  "prodUrl":{
    "dbUrl" : "mongodb://krvikash35:1234@ds053784.mongolab.com:53784/mymongodb",
    "appUrl": "track-my-money.herokuapp.com",
    "appPort": process.env.PORT || "8080"
  },
  "devUrl":{
    "dbUrl" : "mongodb://localhost/trackmymoney",
    "appUrl": "localhost",
    "appPort": "8080"
  },
  "serverSecret": "ILoveCoding",
  "mailSerUser": "tmm.trackmymoney@gmail.com",
  "mailSerUserPwd": "Sur3536#",
  "emailVerSubject": "verify your email to use on trackmymoney",
  "emailverText": "Please find below the 4 digit verification code and enter it while signup",
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
