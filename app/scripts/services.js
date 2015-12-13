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
    E101: 'password must be alphanumeric having 4 and 30 char long and only .*#@ special char allowed!',
    E102: 'Name should be alphanumeric and start with alphabet having 3 and 30 char long!',
    E103: 'At least one account require!',
    E104: 'CreditCard, SavingAccount, DigitalWallet, Cash only allowed!',
    E105: 'start with alphabet between 4 and 16 char; only(_ ) special char!',
    E106: 'Atlest one income source required, max 30!',
    E107: 'income Source name should start with alphabet, between 4 and 20 char long!',
    E108: 'Atlest one expense source required, max 30',
    E109: 'expense source name should start with alphabet, between 4 and 20 char long!',
    E110: 'Invalid Amount-Only number allowed!',
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
    E129: 'Invalid Date!',
    E130: 'Date can not be a future date!',
    E131: 'From Date must be lesser than ToDate!',
    E132: 'You can only see last 1 year record!!',
    E133: '!',
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
    pwdRegex: /^[a-zA-Z0-9.*#@]{4,30}$/,
    nameRegex: /^[a-zA-Z][a-zA-Z0-9 ]{3,30}$/,
    maMinLen: 1,
    maMaxLen: 15,
    iSrcCountMin: 1,
    iSrcCountMax: 30,
    eSrcCountMin: 1,
    eSrcCountMax: 30,
    iSrcRegex: /^[a-zA-Z].{3,20}$/,
    eSrcRegex: /^[a-zA-Z].{3,20}$/,
    amountRegex: /^[0-9]{1,10}$/,
    maTypeRegex: /^(CreditCard|SavingAccount|DigitalWallet|CashAccount)$/,
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
    },


    valMAType : function(maType){
      var err;
      if( !maType || !valConfig.maTypeRegex.test(maType) )
      return err=errConfig.E104;
    },

    valMAName : function(maName){
      var err;
      if( !maName || !valConfig.maNameRegex.test(maName) ){
      return err=errConfig.E105;
      }
    },

    valIncSrc : function(iSrc){
      var err;
      if( !(iSrc instanceof Array) || iSrc.length > valConfig.iSrcCountMax ||  iSrc.length < valConfig.iSrcCountMin )
      return err=errConfig.E106;
      for(var i=iSrc.length; i--;){
        // if( !iSrc[i] || !valConfig.iSrcRegex.test(iSrc[i]) )
        // return err=errConfig.E107;
        if( !iSrc[i] || !iSrc[i].match(valConfig.iSrcRegex) )
        return err=errConfig.E107;
      }
    },

    valExpSrc : function(eSrc){
      var err;
      if( !(eSrc instanceof Array) || eSrc.length > valConfig.eSrcCountMax ||   eSrc.length < valConfig.eSrcCountMin )
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
    },

    valDateForReport : function(fromDate, toDate){
      var err;
      if( fromDate instanceof Date && toDate instanceof Date){
        var today = new Date();
        var diffInDays=(today-fromDate)/(1000*60*60*24);
        // if(toDate > today || fromDate > today)
        // return err=errConfig.E130;
        if(fromDate > toDate)
        return err=errConfig.E131;
        if(diffInDays > 3650){
        return err=errConfig.E132;
      }
      }else{
        return err=errConfig.E129;
      }
    }

  }
});


tmmSer.factory("utilSer", function utilSerFactory(valSer, $timeout, $q, $location){
  var isLoggedIn=false;
  return{
    initSlide : function($scope){
      $scope.myInterval = 3000;
      $scope.noWrapSlides = false;
      var slides = $scope.slides = [];
      $scope.addSlide = function(slideImg, slideLink) {
        slides.push({
          image: slideImg,
          link: slideLink
        });
      };
      var slideDetails=[
        {"imgSrc": "img/tomslide1.jpg", "link": "http://blog.trackourmoney.com/"},
        {"imgSrc": "img/tomslide2.jpg", "link": "http://blog.trackourmoney.com/"}
      ];

      for (var i=slideDetails.length;i--;) {
        $scope.addSlide(slideDetails[i].imgSrc, slideDetails[i].link );
      };
    },

    showFlashMsg: function(scope, msgType,  MsgVar, MsgData, isItFlash,  timeInSec){
      if(msgType == "success"){
        scope.msgType="alert btn-success"
      }else {
        scope.msgType="alert btn-danger"
      }
      scope[MsgVar]=MsgData;
      if(isItFlash){
        if(!timeInSec){
          timeInSec=2;
        }
        $timeout(function(){
          scope[MsgVar]=false;
        },timeInSec*1000);
      }
    }



  }

});
