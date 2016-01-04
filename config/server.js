module.exports = {

  "prodUrl":{
    "dbUrl" : process.env.TOM_DB_URL,
    "appUrl": process.env.TOM_HOST  || '0.0.0.0',
    "appPort": process.env.TOM_PORT || "8081"
  },
  "serverSecret": process.env.SERVER_SECRET,
  "mailSerUser": "krvikash35@gmail.com",
  "mailSerUserPwd": process.env.MAIL_SERVER_PWD,
  "emailVerSubject": "verify your email to use on trackourmoney",
  "emailverText": "Please find below the 4 digit verification code and enter it while signup",
  "emailPwdSubject": "Forgot password of your trackourmoney account",
  "emailPwdText": "Please find below the password, you should chagne your password on nex login at your convenience",
  "tokenExpiresInSecond": 43200,
  "addToGrNotiSub": "you got invite to join the group",
  "delGrTrx": "Group Record Deleted",
  "errMsg" : {
    "invalidRunEvn": "Please enter the valid value for run environment"

  },
  "grTemplate": ["Trip",  "Breakfast", "lunch", "Dinner", "Theater"],
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
  ],
  "nType": {
    "reqToAddGrpMem": 1,
    "delGrTrx": 3
  }
};
