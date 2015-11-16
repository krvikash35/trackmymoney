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
  "trxType":            ["Income, Expense, Transfer"],
  "accountLoginMethod": ["email","phone"],
  "moneyAccountType":   ["SavingAccount", "CreditCard","DigitalWallet","CashAccount"],
  "initIncomeSource":   ["Salary","Dividend","Interest-Principal","Borrwo","Gift","Refund"],
  "initExpenseSource":  ["Fooding","DailyUsageItem","On Family","Travel","Entertainment",
                          "Health","Recharge prepaid-postpaid-DTH",
                          "BillPayment Water-Electricity","paid  EMI","Rent Office-Room",
                          "wages", "paid Tax"],
  "initMoneyAccount":   [
      {"name": "SavingAccount-ICICI",    "type": "SavingAccount", "subAccountBalance": 0},
      {"name": "SavingAccount-Others",   "type": "SavingAccount", "subAccountBalance": 0},
      {"name": "CreditCard-ICICI",       "type": "CreditCard",    "subAccountBalance": 0},
      {"name": "CreditCard-Others",      "type": "CreditCard",    "subAccountBalance": 0},
      {"name": "DigitalWallet-Paytm",    "type": "DigitalWallet", "subAccountBalance": 0},
      {"name": "DigitalWallet-Mobikwik", "type": "DigitalWallet", "subAccountBalance": 0},
      {"name": "DigitalWallet-Others",   "type": "DigitalWallet", "subAccountBalance": 0},
      {"name": "Cash",                   "type": "Cash",          "subAccountBalance": 0}
    ],
  "emailRegex":             /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/gi,
  "moneyAccountNameRegex":  /^(CreditCard|SavingAccount|DigitalWallet|Cash)-/i,
  "pwdLength": {
    "min": 4,
    "max": 25
  }
};
