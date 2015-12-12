module.exports = {

  "runEnv": process.env.runEnv || "prod",
  "prodUrl":{
    "dbUrl" : process.env.OPENSHIFT_MONGODB_DB_URL+ process.env.OPENSHIFT_APP_NAME || process.env.HEROKU_MONGODB_URL,
    "appUrl": process.env.OPENSHIFT_NODEJS_IP || '0.0.0.0',
    "appPort": process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || "8080"
  },
  "devUrl":{
    "dbUrl" : "mongodb://localhost/trackourmoney",
    "appUrl": "0.0.0.0",
    "appPort": "8080"
  },
  "serverSecret": process.env.serverSecret || null,
  "mailSerUser": "vikash@trackourmoney.com" || null,
  "mailSerUserPwd": process.env.mailSerUserPwd,
  "emailVerSubject": "verify your email to use on trackourmoney",
  "emailverText": "Please find below the 4 digit verification code and enter it while signup",
  "emailPwdSubject": "Forgot password of your trackourmoney account",
  "emailPwdText": "Please find below the password, you should chagne your password on nex login at your convenience",
  "tokenExpiresInSecond": 43200,
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
