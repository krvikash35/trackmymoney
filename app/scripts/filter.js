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

tmmFilter.filter('grReportDateRange', function(){
  return function(grTrx, fromDate, toDate){
    console.log(grTrx);
    // console.log(grTrx.gtDate);
    var filtered = [];
    angular.forEach(grTrx, function(grTrx){
      var  dateInMilli = new Date(grTrx.gtDate)
      if(  dateInMilli >= fromDate && dateInMilli <= toDate){
        filtered.push(grTrx);
      }
    })
    return filtered;
  }
})
