'use strict'

var tmmSer = angular.module('tmmSer', []);



tmmSer.factory("errConfig", function errConfigFactory(){
  return{
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
    E129: 'Invalid Date!',
    E130: 'Date can not be a future date!',
    E131: 'From Date must be lesser than ToDate!',
    E132: 'You can only see last 1 year record!'
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
        {"imgSrc": "img/tomslide1.jpg", "link": "http://blog.ckvapps.com/2015/12/about-trackourmoney.html"},
        {"imgSrc": "img/tomslide2.jpg", "link": "http://blog.ckvapps.com/2015/12/managing-group.html"}
      ];

      for (var i=slideDetails.length;i--;) {
        $scope.addSlide(slideDetails[i].imgSrc, slideDetails[i].link );
      };
    },

    showFlashMsg: function(scope, msgType,  MsgVar, MsgData, isItFlash,  timeInSec){
      if(msgType == "success"){
        scope.msgType="msg-green"
      }else {
        scope.msgType="msg-red"
      }
      scope[MsgVar]=MsgData;
      if(isItFlash){
        if(!timeInSec){
          timeInSec=3;
        }
        $timeout(function(){
          scope[MsgVar]=false;
        },timeInSec*1000);
      }
    }



  }

});
