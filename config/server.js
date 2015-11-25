module.exports = {

// looks like mongodb://<user>:<pass>@mongo.onmodulus.net:27017/Mikha4ot
  "runEnv": process.env.runEnv || "prod", // prod or dev
  "prodUrl":{
    "dbUrl" : "mongodb://krvikash35:1234@ds053784.mongolab.com:53784/mymongodb",
    "appUrl": "track-my-money.herokuapp.com",
    "appPort": "8080"
  },
  "devUrl":{
    "dbUrl" : "mongodb://localhost/trackmymoney",
    "appUrl": "localhost",
    "appPort": "8080"
  },
  "serverSecret": "ILoveCoding",
  "tokenExpiresInSecond": 3600,
  "errMsg" : {
    "invalidRunEvn": "Please enter the valid value for run environment"

  },
  "trxType":            ["Income", "Expense", "Transfer"],
  "accountLoginMethod": ["email","phone"],
  "moneyAccountType":   ["SavingAccount", "CreditCard","DigitalWallet","CashAccount"],
  "initIncomeSource":   [{"name": "Salary"}, {"name": "Dividend"},{"name": "Interest-Principal"}
                        ,{"name": "Borrow"}, {"name": "Gift"},{"name": "Refund"}],
  "initExpenseSource":  [{"name": "Fooding"}, {"name": "DailyUsageItem"},{"name": "On Family"}
                        ,{"name": "Travel"}, {"name": "Entertainment"}, {"name": "Health"}
                        ,{"name": "prepaid-postpaid-DTH"},{"name": "Bil-Water-Electric"}
                        ,{"name": "paid-EMI"} ,{"name": "Rent-Office-PG"},{"name": "wages"}
                        ,{"name": "paid-Tax"}],
  "initMoneyAccount":   [
      {"name": "ICICI",    "type": "SavingAccount" },
      {"name": "Others",   "type": "SavingAccount" },
      {"name": "ICICI",    "type": "CreditCard" },
      {"name": "Others",   "type": "CreditCard"},
      {"name": "Paytm",    "type": "DigitalWallet"},
      {"name": "Mobikwik", "type": "DigitalWallet"},
      {"name": "Others",   "type": "DigitalWallet"},
      {"name": "Cash",     "type": "CashAccount"}
    ],
   "emailRegex":             /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/gi,
  // "emailRegex":             /^[a-zA-Z0-9]{1,5}$/gi,
  "moneyAccountNameRegex":  /^(CreditCard|SavingAccount|DigitalWallet|Cash)-/i,
  "pwdLength": {
    "min": 1,
    "max": 25
  }
};
