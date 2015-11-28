'use strict'

var controllerModule = angular.module('controllerModule', []);
//****************************************************************************
// Main controller for handling landing page and controlling navigation item
//**************************************************************************
controllerModule.controller('mainController', function($timeout, $interval, utilSer, valSer, $localStorage, $route,$rootScope, $scope,$location, $http, $window){
  $scope.isLoginFormVisible=true;
  $scope.isRegFormVisible=false;
  //***************************************
  //toggling Login and Registration View
  //**************************************
  $scope.toggleLoginAndRegView=function(){
    $scope.isLoginFormVisible=!$scope.isLoginFormVisible;
    $scope.isRegFormVisible=!$scope.isRegFormVisible;
  };

  //***************************************
  //Controlling Slideshow on feed view
  //**************************************
  utilSer.initSlide($scope);

  //**************************************
  //Processing user loginForm
  //**************************************
  $scope.submitLoginForm = function(loginForm){
    $scope.msg="";
    $http.post('/signin', loginForm)
    .success(function(data, status, headers, config){
      $localStorage.token = data;
      $localStorage.userId= (headers('location').split("/"))[1];
      $scope.$emit('eventLoggedIn', true);
      $location.path(headers('location'));
    })
    .error(function(data, status, headers, config){
      $scope.msg=data;
    })
  }
  //***************************************
  //Processing user regestration form
  //***************************************
  var promisEmailVerProg=null;
  var startEmailVerProg = function(initVal, max, noOfTime, interInMilli){
    $scope.currentVal=initVal;
    $scope.max=max;
    promisEmailVerProg=$interval(function(){
      $scope.currentVal=$scope.currentVal+max/noOfTime;
      if($scope.currentVal == max){
        console.log("timed out");
        $location.path("/main/dlel");
      }
    }, interInMilli, noOfTime)
  }


  $scope.verifyEmail = function verifyEmail(regForm) {
    var err;
    if(!regForm)
    return $scope.msg = "Email is required"
    if ( err=valSer.valEmail(regForm.email) )
    return $scope.msg = err;
    if($scope.isVerCodeSent){
      $http.post('/signup', {signupCode: 2, email: regForm.email, verCode: regForm.verCode})
      .success(function(data, status, headers, config){
        $scope.msg = data;
        $scope.isEmailVerified = true;
        $scope.emailVerButton = "Verified"
      })
      .error(function(data, status, headers, config){
        $scope.msg=data;
      });
    }else {
      $scope.showEmailVerProgress=true;
      $scope.verCodeSentInProgress=true;
      startEmailVerProg(0, 100, 10, 500 );

      $timeout(function(){
        $scope.msg="code sent";
        $scope.isVerCodeSent=true;
        $scope.emailVerButton="Verify Code";
        $scope.verCodeSentInProgress=false;
        $scope.showEmailVerProgress=false;
        $interval.cancel(promisEmailVerProg);
      }, 8000);
      // $http.post('/signup', {signupCode: 1, email: regForm.email})
      // .success(function(data, status, headers, config){
      //   $scope.msg = data;
      //   $scope.isVerCodeSent = true;
      //   $scope.emailVerButton = "Verify Code"
      // })
      // .error(function(data, status, headers, config){
      //   $scope.msg=data;
      // });
    }
  }

  $scope.submitRegForm = function(regForm){
    $scope.msg="";
    if(regForm.password !== regForm.password1){
      return $scope.error="both password does not match!";
    }
    regForm.signupCode=3;
    console.log(regForm);
    $http.post('/signup', regForm)
    .success(function(data, status, headers, config){
      $localStorage.token = data;
      $localStorage.userId= (headers('location').split("/"))[1];
      $scope.$emit('eventLoggedIn', true);
      $location.path(headers('location'));
    })
    .error(function(data, status, headers, config){
      $scope.msg=data;
    });

  };

});


















//*******************************************************************************
//Controller for handing updating and viewing user related info including templete
//********************************************************************************
controllerModule.controller('userInfoController', function($localStorage, $filter, $q, $scope, $rootScope, $location, $http,  $window){
  //******************************************
  //Intializing and populating user Info view
  //******************************************
  $http.get($location.path())
  .success(function(data, status, headers, config){
    userInfoInit(data);
  })
  .error(function(data, status, headers, config){
    $scope.msg=data;
  })

  var userInfoInit = function(userInfo){
    $scope.userBasicInfo=userInfo.account;
    var eSrc=userInfo.sourceOfMoneyTrx.expenseSource;
    var iSrc=userInfo.sourceOfMoneyTrx.incomeSource;
    $scope.expenseSource=[];
    $scope.incomeSource=[];
    $scope.userMoneyAccount=userInfo.moneyAccount;
    for(var i=$scope.userMoneyAccount.length; i--;){
      $scope.userMoneyAccount[i].id=i;
    }
    for(var i=userInfo.sourceOfMoneyTrx.expenseSource.length; i--;){
      $scope.expenseSource.push({id:i, name:eSrc[i]})
    }
    for(var i=userInfo.sourceOfMoneyTrx.incomeSource.length; i--;){
      $scope.incomeSource.push({id:i, name:iSrc[i]})
    }
  }

  $scope.moneyAccountType=["SavingAccount", "CreditCard","DigitalWallet","CashAccount"];
  //***************************************
  //updating Full Name
  //**************************************
  $scope.updateFullName = function(){
    $http.put($location.path(), {updatecode: 7, updateitem: $scope.userBasicInfo.fullname})
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
      $scope.msg=data.data;
    })
    .error(function(data, status, headers, config){
      $scope.msg=data.data;
    })
    return $q.all(result);
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
  //***********************************************************
  // Updating User Expense Source
  //***********************************************************
  $scope.updateExpenseSource = function(){
    var result = [];
    for(var i = $scope.expenseSource.length; i--;){
      var es = $scope.expenseSource[i];
      if(es.isDeleted){
        $scope.expenseSource.splice(i,1);
      }
      if(es.isNew){
        es.isNew = false;
      }
    }
    for(var i=$scope.expenseSource.length; i--;){
      result[i]=$scope.expenseSource[i].name;
    }
    $http.put($location.path(), {updatecode: 1, updateitem: result})
    .success(function(data, status, headers, config){
      $scope.msg=data.data;
    })
    .error(function(data, status, headers, config){
      $scope.msg=data.data;
    })
  }
  $scope.addExpenseSourceRow = function(){
    $scope.expenseSource.push({
      id: $scope.expenseSource.length+1,
      name: "",
      isNew: true
    });
  };
  $scope.filterExpenseAccountRow = function(es){
    return es.isDeleted != true;
  }
  $scope.deleteExpenseSourceRow = function(id){
    var filtered = $filter('filter')($scope.expenseSource, {id: id});
    if (filtered.length) {
      filtered[0].isDeleted = true;
    }
  }
  $scope.cancelExpenseSourceUpdate = function(){
    for (var i = $scope.expenseSource.length; i--;) {
      var es = $scope.expenseSource[i];
      if (es.isDeleted) {
        delete es.isDeleted;
      }
      if (es.isNew) {
        $scope.expenseSource.splice(i, 1);
      }
    };
  };
  //***********************************************************
  // Updating User Income Source
  //***********************************************************
  $scope.updateIncomeSource = function(){
    var result = [];
    for(var i = $scope.incomeSource.length; i--;){
      var is = $scope.incomeSource[i];
      if(is.isDeleted){
        $scope.incomeSource.splice(i,1);
      }
      if(is.isNew){
        is.isNew = false;
      }
    }
    for(var i=$scope.incomeSource.length; i--;){
      result[i]=$scope.incomeSource[i].name;
    }
    $http.put($location.path(), {updatecode: 2, updateitem: result})
    .success(function(data, status, headers, config){
      $scope.msg=data.data;
    })
    .error(function(data, status, headers, config){
      console.log(data.data);
      $scope.msg=data.data;
    })
  }
  $scope.addIncomeSourceRow = function abc(){
    $scope.incomeSource.push({
      id: $scope.incomeSource.length+1,
      name: "",
      isNew: true
    });
  };
  $scope.filterIncomeSourceRow = function(is){
    return is.isDeleted != true;
  }
  $scope.deleteIncomeSourceRow = function(id){
    var filtered = $filter('filter')($scope.incomeSource, {id: id});
    if (filtered.length) {
      filtered[0].isDeleted = true;
    }
  }
  $scope.cancelIncomeSourceUpdate = function(){
    for (var i = $scope.incomeSource.length; i--;) {
      var is = $scope.incomeSource[i];
      if (is.isDeleted) {
        delete is.isDeleted;
      }
      if (is.isNew) {
        $scope.incomeSource.splice(i, 1);
      }
    };
  };


});













































































//**************************************************************************************
// Controller for handling user transaction
//**************************************************************************************
controllerModule.controller('userTrxController', function($localStorage, $scope, $routeParams, $rootScope, $location, $http,  $window){
  var usrIncomeSrc=[];
  var usrExpenseSrc=[];
  var usrMoneyAcct=[];
  var trxUiInit=function(user){
    usrIncomeSrc=user.sourceOfMoneyTrx.incomeSource;
    usrExpenseSrc=user.sourceOfMoneyTrx.expenseSource;
    // user.sourceOfMoneyTrx.incomeSource.forEach(function(is){
    //   usrIncomeSrc.push(is.name);
    // });
    // user.sourceOfMoneyTrx.expenseSource.forEach(function(es){
    //   usrExpenseSrc.push(es.name);
    // })
    user.moneyAccount.forEach(function(ma){
      usrMoneyAcct.push(ma.type+"-"+ma.name);
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
      console.log(usrIncomeSrc[0]);
      break;
      case 'Transfer':
      $scope.trxSource=usrMoneyAcct;
      $scope.trxDestination=usrMoneyAcct;
      $scope.trx.source=usrMoneyAcct[0];
      $scope.trx.destination=usrMoneyAcct[0];
      console.log(usrMoneyAcct[0]);
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
    trxUiInit(data);
  })
  .error(function(data, status, headers, config){
    $scope.msg=data;
  });
  $scope.submitTrxForm=function(trxForm){
    $http.post($location.path(), trxForm)
    .success(function(data, status, headers, config){
      $scope.msg=data;
    })
    .error(function(data, status, headers, config){
      $scope.msg=data;
    })
  }
  $scope.trxTypeChanged = function(trxType){
    trxUiHandler(trxType);
  }
})








//************************************************************************************
//Controller for handling user transaction report
//***********************************************************************************
controllerModule.controller('userReportController', function($localStorage, $scope, $rootScope, $location, $http,  $window){
  $http.get($location.path())
  .success(function(data, status, headers, config){
    $scope.userTrxReport=data;
  })
  .error(function(data, status, headers, config){
    $scope.msg=data;
  })
})

//************************************************************************************
//Navigation controller
//************************************************************************************
controllerModule.controller('naviCtrl', function($interval, $scope, $rootScope, $location, $localStorage){
  //***************************************
  //Logout function redirecteding to home
  //**************************************

  if($localStorage.token){
    $scope.isLogged=true;
    $scope.userId=$localStorage.userId;
  }

  $scope.$on('eventLoggedIn', function (event, args) {
    $scope.isLogged=args;
    $scope.userId=$localStorage.userId;
  })

  $scope.logout = function(){
    delete $localStorage.token;
    delete $localStorage.userId;
    $scope.userId=null;
    $scope.isLogged = false;
    $location.path('/main');
  };
})
