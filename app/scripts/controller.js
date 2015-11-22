'use strict'

var controllerModule = angular.module('controllerModule', []);
//****************************************************************************
// Main controller for handling landing page and controlling navigation item
//**************************************************************************
controllerModule.controller('mainController', function($localStorage, $route,$rootScope, $scope,$location, $http, $window){
  $scope.isLoginFormVisible=true;
  $scope.isRegFormVisible=false;
  $rootScope.isLandingPageVisible=true;
  //***************************************
  //toggling Login and Registration View
  //**************************************
  $scope.toggleLoginAndRegView=function(){
    $scope.isLoginFormVisible=!$scope.isLoginFormVisible;
    $scope.isRegFormVisible=!$scope.isRegFormVisible;
  };
  //***************************************
  //Logout function redirecteding to home
  //**************************************
  $scope.logout = function(){
    delete $localStorage.token;
    $window.location.href='';
  }
  //***************************************
  //Controlling Slideshow on feed view
  //**************************************
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
  //**************************************
  //Processing user loginForm
  //**************************************
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
  //***************************************
  //Processing user regestration form
  //***************************************
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


















//*******************************************************************************
//Controller for handing updating and viewing user related info including templete
//********************************************************************************
controllerModule.controller('userInfoController', function($filter, $q, $scope, $rootScope, $location, $http,  $window){
  $rootScope.isLandingPageVisible=false;
  //******************************************
  //Intializing and populating user Info view
  //******************************************
  var userInfoInit = function(userInfo){
    $scope.userBasicInfo=userInfo.account;
    $scope.expenseSource=userInfo.sourceOfMoneyTrx.expenseSource;
    $scope.incomeSource=userInfo.sourceOfMoneyTrx.incomeSource;
    $scope.userMoneyAccount=userInfo.moneyAccount;
    for(var i=$scope.userMoneyAccount.length; i--;){
      $scope.userMoneyAccount.id=i;
    }
    for(var i=$scope.expenseSource.length; i--;){
      $scope.expenseSource.id=i;
    }
    for(var i=$scope.incomeSource.length; i--;){
      $scope.incomeSource.id=i;
    }
  }
  $http.get($location.path())
  .success(function(data, status, headers, config){
    userInfoInit(data.data);
  })
  .error(function(data, status, headers, config){
    $scope.msg=data.data;
  })
  $scope.moneyAccountType=["SavingAccount", "CreditCard","DigitalWallet","CashAccount"];
  //***************************************
  //updating Full Name
  //**************************************
  $scope.updateFullName = function(){
    $http.put($location.path(), {updatecode: 7, updateitem: $scope.userBasicInfo.password})
    .success(function(data, status, headers, config){
      $scope.msg=data.data;
    })
    .error(function(data, status, headers, config){
      $scope.msg=data.data;
    })
  }
  //***************************************
  //Updating Password
  //**************************************
  $scope.updatePassword = function(){
    $http.put($location.path(), {updatecode: 4, updateitem: $scope.userBasicInfo.password})
    .success(function(data, status, headers, config){
      $scope.msg=data.data;
    })
    .error(function(data, status, headers, config){
      $scope.msg=data.data;
    })
  }
  //***********************************************************
  // Updating User Money Account
  //***********************************************************
  $scope.updateMoneyAccount = function(){
    var result = [];
    for(var i = $scope.userMoneyAccount.length; i--;){
      var ma = $scope.userMoneyAccount[i];
      if(ma.isDeleted){
        $scope.userMoneyAccount.splice(i,1);
      }
      if(ma.isNew){
        ma.isNew = false;
      }
      result.push(ma);
    }
    $http.put($location.path(), {updatecode: 3, updateitem: $scope.userMoneyAccount})
    .success(function(data, status, headers, config){
      console.log(data.data);
    })
    .error(function(data, status, headers, config){
      console.log(data.data);
    })
  }
  $scope.addMoneyAccountRow = function(){
    $scope.userMoneyAccount.push({
      id: $scope.userMoneyAccount.length+1,
      type: "SavingAccount",
      name: "",
      isNew: true
    });
  };
  $scope.filterMoneyAccountRow = function(ma){
    return ma.isDeleted != true;
  }
  $scope.deleteMoneyAccountRow = function(id){
    var filtered = $filter('filter')($scope.userMoneyAccount, {id: id});
    if (filtered.length) {
      filtered[0].isDeleted = true;
    }
  }
  $scope.cancelMoneyAccountUpdate = function(){
    for (var i = $scope.userMoneyAccount.length; i--;) {
      var ma = $scope.userMoneyAccount[i];
      if (ma.isDeleted) {
        delete ma.isDeleted;
      }
      if (ma.isNew) {
        $scope.userMoneyAccount.splice(i, 1);
      }
    };
  };
});



















//**************************************************************************************
// Controller for handling user transaction
//**************************************************************************************
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
  })
  .error(function(data, status, headers, config){
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








//************************************************************************************
//Controller for handling user transaction report
//***********************************************************************************
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
