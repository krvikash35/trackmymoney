var valConfig = require('../config/val')
var errConfig = require('../config/error')

var valMeth = (function()){


valEmail : function(email){
  var err;
  if(!email || !valConfig.emailRegex.test(email) )
  return err=errConfig.E100;
},



valPwd : function(pwd){
  var err;
  if( !pwd || !valConfig.pwdRegex.test(pwd) )
  return err=errConfig.E101;
},

valName : function(name){
  var err;
  if( !name || !valConfig.nameRegex.test(name))
  return err=errConfig.E102;
},

valMAcct : function(ma){
  var err;
  if( !(ma instanceof Array) || ma.length > valConfig.maMaxLen || ma.length < valConfig.maMinLen )
  return err=errConfig.E103;
  for(var i=ma.length; i--;){
    if( !ma[i].type|| !valConfig.maTypeRegex.test(ma[i].type) )
    return err=errConfig.E104;
    if( !ma[i].name || !valConfig.maNameRegex.test(ma[i].name) )
    return err=errConfig.E105;
  }
},

valIncSrc : function(iSrc){
  var err;
  if( !(iSrc instanceof Array) || iSrc.length > valConfig.iSrcMaxLen ||  iSrc.length < valConfig.iSrcMinLen )
  return err=errConfig.E106;
  for(var i=iSrc.length; i--;){
    if( !iSrc[i] || !valConfig.iSrcRegex.test(iSrc[i]) )
    return err=errConfig.E107;
  }
},

valExpSrc : function(eSrc){
  var err;
  if( !(eSrc instanceof Array) || eSrc.length > valConfig.eSrcMaxLen ||
  eSrc.length < valConfig.eSrcMinLen )
  return err=errConfig.E108;
  for(var i=eSrc.length; i--;){
    if( !eSrc[i] || !valConfig.eSrcRegex.test(eSrc[i]) )
    return err=errConfig.E109;
  }
},

valAmount : function(amount){
  var err;
  if( !amount || !valConfig.amountRegex.test(amount) )
  return errConfig.E110;
},

valTrxDesc : function(desc){
  var err;
  if(desc){
    if( desc.length > valConfig.trxDescMaxLen )
    return errConfig.E111;
  }
}


})();
