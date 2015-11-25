var valConfig = require('../config/val')
var errConfig = require('../config/error')

module.exports = {
  valEmail: valEmail,
  valPwd: valPwd,
  valName: valName,
  valMAcct: valMAcct,
  valIncSrc: valIncSrc,
  valExpSrc: valExpSrc,
  valAmount: valAmount,
  valTrxDesc: valTrxDesc
}



var valEmail = function(email){
  var err;
  if(pwd === undefined || pwd == null || typeof(pwd) !== 'string' ||  email.length > valConfig.emailMaxLen || (!email.match(valConfig.emailRegex)) )
  return err=errConfig.E100;
}

var valPwd = function(pwd){
  var err;
  if( pwd === undefined || pwd === null || (!valConfig.pwdRegex.test(pwd)) )
  return err=errConfig.E101;
}

var valName = function(name){
  var err;
  if(name === undefined || name === null || (!valConfig.nameRegex.test(name)))
  return err=errConfig.E102;
}

var valMAcct = function(ma){
  var err;
  if( !(ma instanceof Array) || ma.length > valConfig.maMaxLen || ma.length < valConfig.maMinLen )
  return err=errConfig.E103;
  for(var i=ma.length; i--;){
    if( ma[i].type === undefined || !valConfig.maTypeRegex.test(ma[i].type) )
    return err=errConfig.E104;
    if( ma[i].name === undefined || !valConfig.maNameRegex.test(ma[i].name) )
    return err=errConfig.E105;
  }
}

var valIncSrc = function(iSrc){
  var err;
  if( !(iSrc instanceof Array) || iSrc.length > valConfig.iSrcMaxLen ||  iSrc.length < valConfig.iSrcMinLen )
  return err=errConfig.E106;
  for(var i=iSrc.length; i--;){
    if( iSrc[i] === undefined || !valConfig.iSrcRegex.test(iSrc[i]) )
    return err=errConfig.E107;
  }
}

var valExpSrc = function(eSrc){
  var err;
  if( !(eSrc instanceof Array) || eSrc.length > valConfig.eSrcMaxLen ||
  eSrc.length < valConfig.eSrcMinLen )
  return err=errConfig.E108;
  for(var i=eSrc.length; i--;){
    if( eSrc[i] === undefined || !valConfig.eSrcRegex.test(eSrc[i]) )
    return err=errConfig.E109;
  }
}

var valAmount = function(amount){
  var err;
  if( amount === undefined || amount === null || !valConfig.amountRegex.test(amount) )
  return errConfig.E110;
}

var valTrxDesc = function(desc){
  var err;
  if(desc){
    if( desc.length > valConfig.trxDescMaxLen )
    return errConfig.E111;
  }
}
