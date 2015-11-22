'use strict'

var controllerModule = angular.module('controllerModule', []);

controllerModule.controller('mainController', function($localStorage, $route,$rootScope, $scope,$location, $http, $window){
  $scope.isLoginFormVisible=true;
  $scope.isRegFormVisible=false;
  $rootScope.isLandingPageVisible=true;

  $scope.toggleLoginAndRegView=function(){
    $scope.isLoginFormVisible=!$scope.isLoginFormVisible;
    $scope.isRegFormVisible=!$scope.isRegFormVisible;
  };

  $scope.logout = function(){
    delete $localStorage.token;
    $window.location.href='';
    // $rootScope.isLandingPageVisible=true;
  }

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

  $scope.submitLoginForm = function(loginForm){
    $scope.msg="";
    $http.post('/signin', loginForm)
    .success(function(data, status, headers, config){
      $localStorage.token = data.data;
      $scope.userId=(headers('location').split("/"))[1];
      $location.path(headers('location'));
    })
    .error(function(data, status, headers, config){
      $scope.msg=data.data;
    })
  }

  $scope.submitRegForm = function(regForm){
    $scope.msg="";
    if(regForm.password !== regForm.password1){
      return $scope.error="both password does not match!";
    }
    $http.post('/signup', regForm)
    .success(function(data, status, headers, config){
      $localStorage.token = data.data;
      $scope.userId=(headers('location').split("/"))[1];
      $location.path(headers('location'));
    })
    .error(function(data, status, headers, config){
      $scope.msg=data.data;
    });

  };

});


controllerModule.controller('userInfoController', function($filter, $q, $scope, $rootScope, $location, $http,  $window){
  $rootScope.isLandingPageVisible=false;

  var userInfoInit = function(userInfo){
    $scope.userMoneyAccount=userInfo.moneyAccount;
    $scope.userBasicInfo=userInfo.account;
    $scope.userSourceOfTrx=userInfo.sourceOfMoneyTrx;
  }

  $http.get($location.path())
  .success(function(data, status, headers, config){
    userInfoInit(data.data);
  })
  .error(function(data, status, headers, config){
    $scope.msg=data.data;
  })

  $scope.moneyAccountType=["SavingAccount", "CreditCard","DigitalWallet","CashAccount"];

  $scope.addMoneyAccount = function(){
    $scope.userMoneyAccount.push({

      type: "",
      name: $scope.userMoneyAccount.length+1
    });
  };


  $scope.deleteMoneyAccount = function(id){
    var filtered = $filter('filter')($scope.userMoneyAccount, {id: id});
console.log("id"+id);
    if (filtered.length) {
      filtered[0].isDeleted = true;
      console.log("delete");
    }
  }

  $scope.saveMoneyAccountForm = function(){
    console.log("save called");
    var result = [];
    for(var i = $scope.userMoneyAccount.length; i--;){
      var ma = $scope.userMoneyAccount[i];
      if(ma.isDeleted){
        $scope.userMoneyAccount.splice(i,1);
      }
      if(ma.isNew){
        ma.isNew = false;
      }
      console.log(ma.id);
      result.push(ma);
    // console.log(result[i]);
    }

  }



});




controllerModule.controller('userTrxController', function($scope, $routeParams, $rootScope, $location, $http,  $window){
  $rootScope.isLandingPageVisible=false;

  var usrIncomeSrc=[];
  var usrExpenseSrc=[];
  var usrMoneyAcct=[];

  var trxUiInit=function(user){
    usrIncomeSrc=user.sourceOfMoneyTrx.incomeSource;
    usrExpenseSrc=user.sourceOfMoneyTrx.expenseSource;
    user.moneyAccount.forEach(function(ma){
      usrMoneyAcct.push(ma.type+ma.name);
    });
    trxUiHandler();
  }

  var trxUiHandler=function(trxType){
    if(trxType === undefined || trxType === null){
      trxType = 'Expense';
    }
    switch (trxType) {
      case 'Income':
      $scope.trxSource=usrIncomeSrc;
      $scope.trxDestination=usrMoneyAcct;
      $scope.trx.source=usrIncomeSrc[0];
      $scope.trx.destination=usrMoneyAcct[0];
      break;
      case 'Transfer':
      $scope.trxSource=usrMoneyAcct;
      $scope.trxDestination=usrMoneyAcct;
      $scope.trx.source=usrMoneyAcct[0];
      $scope.trx.destination=usrMoneyAcct[0];
      break;
      default: //Expense
      $scope.trxSource=usrExpenseSrc;
      $scope.trxDestination=usrMoneyAcct;
      $scope.trx.source=usrExpenseSrc[0];
      $scope.trx.destination=usrMoneyAcct[0];
    }
  }


  $http.get("/user/"+$routeParams.userId+"/info")
  .success(function(data, status, headers, config){
    trxUiInit(data.data);
    console.log("succss while connecting to db"+status);
    // console.log("DebugUser1"+JSON.stringify(user));
  })
  .error(function(data, status, headers, config){
    console.log("error while connecting to db"+status+data);
    $scope.error=data.data;
  });


  $scope.submitTrxForm=function(trxForm){
    $http.post($location.path(), trxForm)
    .success(function(data, status, headers, config){
      $scope.msg=data.data;
    })
    .error(function(data, status, headers, config){
      $scope.msg=data.data;
    })
  }

  $scope.trxTypeChanged = function(trxType){
    trxUiHandler(trxType);
  }

})

controllerModule.controller('userReportController', function($scope, $rootScope, $location, $http,  $window){
  $rootScope.isLandingPageVisible=false;
  $http.get($location.path())
  .success(function(data, status, headers, config){
    $scope.userTrxReport=data.data;
  })
  .error(function(data, status, headers, config){
    $scope.userInfo=data.data;
  })
})
