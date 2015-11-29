'use strict'

// Declare app level module which depends on other module
var trackMyMoney = angular.module('trackMyMoney', [
  'controllerModule',
  'tmmSer',
  'ngRoute',
  'ui.bootstrap',
  'ngStorage',
  'xeditable'
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
    controller: 'userReportController'
  }).
  when('/user/:userId/trx', {
    templateUrl: 'partials/usertrxn.html',
    controller: 'userTrxController'
  }).
  when('/main', {
    templateUrl: 'partials/auth.html',
    controller: 'mainController'
  }).
  otherwise({
    redirectTo: '/main'
  })
}
]);


//interceptor for request and response to modify authorization headers
trackMyMoney.config(function interceptReqRes($httpProvider){
  $httpProvider.interceptors.push(function($q, $location, $localStorage, $window) {
    return {
      'request': function configReqHeader(config) {
        config.headers = config.headers || {};
        if ($localStorage.token) {
          config.headers.Authorization = 'Bearer ' + $localStorage.token;
        }
        return config;
      }
    };
  });
});




trackMyMoney.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'
});
