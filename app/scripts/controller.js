'use strict'

var controllerModule = angular.module('controllerModule', []);

controllerModule.controller('authController',function($rootScope, $scope,$location){
  $scope.isLoginFormVisible=true;
  $scope.isRegFormVisible=false;
  $rootScope.currentPath=$location.path();

  $scope.toggleLoginAndRegView=function(){
    console.log("inside toggleLoginAndRegView");
    $scope.isLoginFormVisible=!$scope.isLoginFormVisible;
    $scope.isRegFormVisible=!$scope.isRegFormVisible;
  };
});
