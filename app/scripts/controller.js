'use strict'

var controllerModule = angular.module('controllerModule', []);

controllerModule.controller('mainController',function($rootScope, $scope,$location){
  $scope.isLoginFormVisible=true;
  $scope.isRegFormVisible=false;
  $rootScope.currentPath=$location.path();

  $scope.toggleLoginAndRegView=function(){
    console.log("inside toggleLoginAndRegView");
    $scope.isLoginFormVisible=!$scope.isLoginFormVisible;
    $scope.isRegFormVisible=!$scope.isRegFormVisible;
  };

  $scope.myInterval = 5000;
  $scope.noWrapSlides = false;
  var slides = $scope.slides = [];
  $scope.addSlide = function() {
    var newWidth = 600 + slides.length + 1;
    slides.push({
      image: '//placekitten.com/' + newWidth + '/300'

    });
  };
  for (var i=0; i<5; i++) {
    $scope.addSlide();
  }
});
