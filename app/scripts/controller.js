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

  $scope.myInterval = 5000;
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
    $scope.error="";
    $http.post('/signin', loginForm)
    .success(function(data, status, headers, config){
      $localStorage.token = data.data;
      $location.path(headers('location'));
    })
    .error(function(data, status, headers, config){
      $scope.error=data.data;
    })
  }

  $scope.submitRegForm = function(regForm){
    $scope.error="";
    if(regForm.password !== regForm.password1){
      return $scope.error="both password does not match!";
    }
    $http.post('/signup', regForm)
    .success(function(data, status, headers, config){
      console.log("DebugToken:"+data.data);
      $localStorage.token = data.data;
      $location.path(headers('location'));
    })
    .error(function(data, status, headers, config){
      $scope.error=data.data;
    });

  };

});

controllerModule.controller('userInfoController', function($scope, $rootScope, $location, $http,  $window){
  $rootScope.isLandingPageVisible=false;
  $http.get($location.path())
  .success(function(data, status, headers, config){
    $scope.userInfo=data;
  })
  .error(function(data, status, headers, config){
    $scope.userInfo=data;
  })
});


controllerModule.controller('userTrxController', function($scope, $rootScope, $location, $http,  $window){
  $rootScope.isLandingPageVisible=false;
  $scope.submitTrxForm=function(trxForm){
    $http.post($location.path(), trxForm)
    .success(function(data, status, headers, config){
        //Todo
    })
    .error(function(data, status, headers, config){
      //Todo
    })
  }
})

controllerModule.controller('userReportController', function($scope, $rootScope, $location, $http,  $window){
  $rootScope.isLandingPageVisible=false;
  $http.get($location.path())
  .success(function(data, status, headers, config){
    $scope.userInfo=data;
  })
  .error(function(data, status, headers, config){
    $scope.userInfo=data;
  })
})
