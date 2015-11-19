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
          $location.path('/signin');
        }
        return $q.reject(response);
      }
    };
  }]);

}]);
