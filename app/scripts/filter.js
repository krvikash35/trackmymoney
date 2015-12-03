'use strict'

var tmmFilter = angular.module('tmmFilter', []);

tmmFilter.filter('reportDateRange', function(){
  return function(prsTrx, fromDate, toDate){
    var filtered = [];


    angular.forEach(prsTrx, function(prsTrx){
      var  dateInMilli = new Date(prsTrx.date)
      if(  dateInMilli >= fromDate && dateInMilli <= toDate){
        filtered.push(prsTrx);
      }
    })
    return filtered;
  }
})
