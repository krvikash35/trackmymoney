module.exports = {
  emailRegex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
  emailMaxLen: 50,
  pwdRegex: /^[a-zA-Z0-9.*#@]{4,30}$/,
  nameRegex: /^[a-zA-Z][a-zA-Z0-9 ]{3,30}$/,
  maMinLen: 1,
  maMaxLen: 15,
  iSrcRegex: /^[a-zA-Z][a-zA-Z0-9@-_]{3,20}$/,
  eSrcRegex: /^[a-zA-Z][a-zA-Z0-9@-_]{3,20}$/,
  amountRegex: /^[0-9]{1,10}$/,
  maTypeRegex: /^(CreditCard|SavingAccount|DigitalWallet|Cash)$/,
  maNameRegex: /^[a-zA-Z][a-zA-Z0-9- _]{3,15}$/,
  trxTypeRegex: /^(Income|Saving|Transfer)$/,
  trxDescMaxLen: 4,
  grNameMinLen: 4
}
