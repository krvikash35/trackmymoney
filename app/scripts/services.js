'use strict'

var tmmSer = angular.module('tmmSer', []);



tmmSer.factory("errConfig", function errConfigFactory(){
  return{
    S100: 'verification code sent to your email',
    S101: 'Email should be between 5 and 50 char!',
    S102: 'Invalid email pattern!',
    S103: 'Password shoudl be string!',
    S104: 'Password should be between 5 and 50 char!',
    S105: 'Name should be string!',
    S106: 'Name should be between 5 and 50 char!',
    S107: 'Money account should be array!',
    S108: 'At least one MoneyAccount required!',
    S109: 'Income source should be array!',
    S110: 'At least one income source required!',
    S111: 'Expense source should be array!',
    S112: 'At least one expense source required!',
    S113: '',
    S114: '',
    S115: '',
    S116: '',
    S117: '',
    S118: '',
    S119: '',
    S120: '',
    S121: '',
    E100: 'Invalid Email!',
    E101: 'Invalid Password!',
    E102: 'Invalid Name!',
    E103: 'Invalid Money Account!',
    E104: 'Invalid IMoney Account Type!',
    E105: 'Invalid Money Account Name!',
    E106: 'Invalid Income Source!',
    E107: 'Invalid Income Source Name!',
    E108: 'Inavlid Expnese Source',
    E109: 'Invalid Expnese Source Name!',
    E110: 'Invalid Amount!',
    E111: 'Invalid Transaction Description!',
    E112: 'Token not found in request!',
    E113: 'Authorization Header not found!',
    E114: 'Token Expire!',
    E115: 'Invalid Token!',
    E116: 'Resource not matching with user',
    E117: 'We are having problem with connecting to DB..Dont worry, will be back soon',
    E118: 'Error Occured while sending email',
    E119: 'Invalid Email or password',
    E120: 'DB Error Occured while querying',
    E121: 'DB Error Occured while Saving',
    E122: 'Email not found on our system!',
    E123: 'Wrong password!',
    E124: 'User is already register and verified!',
    E125: 'Wrong Verification Code',
    E126: 'Invalid Signup Options!',
    E127: 'Please verify your email before signup!',
    E128: '!',
    E129: 'Invalid Income Source Name!',
    E130: 'Inavlid Expnese Source',
    E131: 'Invalid Expnese Source Name!',
    E131: 'Invalid Amount!',
    E132: 'Invalid Transaction Description!',
    E133: 'Token not found in request!',
    E134: 'Authorization Header not found!',
    E135: 'Token Expire!',
    E136: 'Invalid Token!',
    E137: 'Resource not matching with user',
    E138: 'We are having problem with connecting to DB..Dont worry, will be back soon',
    E139: 'Error Occured while sending email',
    E140: 'Invalid Email or password',
    E141: 'DB Error Occured while querying',
    E142: 'DB Error Occured while Saving'
  }
});


tmmSer.factory("valConfig", function valConfigFactory(){
  return{
    emailRegex: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/,
    emailMaxLen: 50,
    pwdRegex: /^[a-zA-Z.*#@]{4,30}$/,
    nameRegex: /^[a-zA-Z][a-zA-Z0-9 ]{3,30}$/,
    maMinLen: 1,
    maMaxLen: 15,
    iSrcRegex: /^[a-zA-Z][a-zA-Z0-9@-_]{3,20}$/,
    eSrcRegex: /^[a-zA-Z][a-zA-Z0-9@-_]{3,20}$/,
    amountRegex: /^[0-9]{1,10}$/,
    maTypeRegex: /^(CreditCard|SavingAccount|DigitalWallet|Cash)$/,
    maNameRegex: /^[a-zA-Z][a-zA-Z0-9- _]{3,15}$/,
    trxTypeRegex: /^(Income|Saving|Transfer)$/,
    trxDescMaxLen: 4
  }
})


tmmSer.factory("valSer", function valSerFactory(errConfig, valConfig){
  return {

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
  }

});


tmmSer.factory("utilSer", function utilSerFactory(valSer){
  var isLoggedIn=false;

  return{

    initSlide : function($scope){
      $scope.myInterval = 3000;
      $scope.noWrapSlides = false;
      var slides = $scope.slides = [];
      $scope.addSlide = function() {
        var newWidth = 0 + slides.length + 1;
        slides.push({
          image: 'img/beauti' + newWidth + '.jpg'
        });
      };
      for (var i=0; i<4; i++) {
        $scope.addSlide();
      };
    },

    getIsLoggedIn : function(){
      return isLoggedIn;
    },

    setIsLoggedIn : function(value){
      isLoggedIn=value;
    }


  }
});
