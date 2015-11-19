'use strict'

var controllerModule = angular.module('controllerModule', []);

controllerModule.controller('mainController', ['$rootScope', '$scope', '$location', '$http', '$window',
                                      function($rootScope, $scope,$location, $http, $window){
  $scope.isLoginFormVisible=true;
  $scope.isRegFormVisible=false;
  $rootScope.currentPath=$location.path();
  console.log("current"+$location.path());
  $scope.toggleLoginAndRegView=function(){
    console.log("inside toggleLoginAndRegView");
    $scope.isLoginFormVisible=!$scope.isLoginFormVisible;
    $scope.isRegFormVisible=!$scope.isRegFormVisible;
  };

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

  $scope.submitLoginForm(){
    
  }


  $scope.submitRegForm = function(regForm){
    // $location.path('/user/1234/info');
    // $scope.$apply();
    $window.location.href = "#/user/123/info";
    $scope.$apply().replace();

    // $window.location = "#/user/123/info";
    // $scope.error="";
    // if(regForm.password !== regForm.password1){
    //   return $scope.error="both password does not match!";
    // }
    // $http.post('/signup', regForm)
    // .success(function(data, status, headers, config){
    //   console.log(headers('location'));
    //
    // })
    // .error(function(data, status, headers, config){
    //   $scope.error=data.data;
    // });
  };

}]);

controllerModule.controller('userInfoController', function($scope, $http, $location, $window){
  $scope.name="Vikash";
});
