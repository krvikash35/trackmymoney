'use strict'

// Declare app level module which depends on other module
var trackMyMoney = angular.module('trackMyMoney', [
  'controllerModule',
  'serviceModule',
  'ngRoute',
  'ui.bootstrap',
  'ngStorage'
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
  when('', {
    templateUrl: 'index.html'
  })
}
]);


//interceptor for request and response to modify authorization headers

trackMyMoney.config(['$httpProvider', function($httpProvider){
  $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
    return {
      'request': function (config) {
        config.headers = config.headers || {};
        if ($localStorage.token) {
          config.headers.Authorization = 'Bearer ' + $localStorage.token;
        }
        console.log("debugHeaders:"+config);
        return config;
      },
      'responseError': function(response) {
        if(response.status === 401 || response.status === 403) {
          $window.location.href='';
        }
        return $q.reject(response);
      }
    };
  }]);

}]);
