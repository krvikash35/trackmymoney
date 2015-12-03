'use strict'

var tmmFilter = angular.module('tmmFilter', []);

tmmFilter.filter('reportDateRange', function(){
  return function(prsTrx, fromDate, toDate){
    var filtered = [];
    console.log("enter filter");
    angular.forEach(prsTrx, function(prsTrx){
      if( prsTrx.date > fromDate && prsTrx.date < toDate){
        filtered.push(prsTrx);
      }
    })
    return filtered;
  }
})
