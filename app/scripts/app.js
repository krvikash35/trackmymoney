'use strict'

// Declare app level module which depends on other module
var trackMyMoney = angular.module('trackMyMoney', [
  'controllerModule',
  'serviceModule',
  'ngRoute',
  'ui.bootstrap'
]);




//config the module to wire controller, view template and current URL
trackMyMoney.config(['$routeProvider',
function($routeProvider){
  $routeProvider.
  when('/user/:userId/info', {
    templateUrl: 'partials/userinfo.html',
    controller: 'userInfoController'
  }).
  when('/user/:userId/report', {
    templateUrl: 'partials/userreport.html',
    controller: ''
  }).
  when('/user/:userId/trxn', {
    templateUrl: 'partials/usertrxn.html',
    controller: ''
  }).
  otherwise({
    redirectTo: ''
  });
}
]);
