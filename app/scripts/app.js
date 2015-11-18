'use strict'

// Declare app level module which depends on other module
var appModule = angular.module('trackMyMoney', [
  'controllerModule',
  'serviceModule',
  'ngRoute'
]);




//config the module to wire controller, view template and current URL
appModule.config(['$routeProvider',
function($routeProvider){
  $routeProvider.
  // when('/login', {
  //   templateUrl: 'partials/auth.html',
  //   controller: 'mainController'
  // }).
  when('/user/info', {
    templateUrl: 'partials/prsnlinfo.html'
  }).
  when('/user/report', {
    templateUrl: 'partials/report.html'
  }).
  when('/user/trxn', {
    templateUrl: 'partials/trxn.html'
  }).
  when('/afterlogin', {
    templateUrl: 'partials/prsnlInfo.html'
  }).
  otherwise({
    redirectTo: '/login'
  });
}
]);
