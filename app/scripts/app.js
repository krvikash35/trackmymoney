'use strict'

// Declare app level module which depends on other module
var appModule = angular.module('trackMyMoney', [
  'ngRoute'
]);

appModule.controller('mainController',function($scope){
  $scope.isLoginFormVisible=true;
  $scope.isRegFormVisible=false;

  $scope.toggleLoginAndRegView=function(){
    console.log("inside toggleLoginAndRegView");
    $scope.isLoginFormVisible=!$scope.isLoginFormVisible;
    $scope.isRegFormVisible=!$scope.isRegFormVisible;
  };
});


//config the module to wire controller, view template and current URL
appModule.config(['$routeProvider',
function($routeProvider){
  $routeProvider.
  when('/login', {
    templateUrl: 'partials/auth.html',
    controller: 'mainController'
  }).
  when('/afterlogin', {
    templateUrl: 'components/afterLogin/afterLogin.html'
  }).
  otherwise({
    redirectTo: '/login'
  });
}
]);
