'use strict'

var tmmFilter = angular.module('tmmFilter', []);

tmmFilter.filter('reportDateRange', function(){
  return function(prsTrx, fromDate, toDate){
    if(prsTrx && prsTrx.length!=0){
      var filtered = [];
      angular.forEach(prsTrx, function(prsTrx){
        var  dateInMilli = new Date(prsTrx.date)
        if(  dateInMilli >= fromDate && dateInMilli <= toDate){
          filtered.push(prsTrx);
        }
      })
      return filtered;
    }
  }
})

tmmFilter.filter('grReportDateRange', function(){
  return function(grTrx, fromDate, toDate){
    if(grTrx && grTrx.length!=0){
      var filtered = [];
      angular.forEach(grTrx, function(grTrx){
        var  dateInMilli = new Date(grTrx.gtDate)
        if(  dateInMilli >= fromDate && dateInMilli <= toDate){
          filtered.push(grTrx);
        }
      })
      return filtered;
    }
  }
})

tmmFilter.filter('nameByEmail', function(){
  return function(email, grMem){
    var filtered ;
    for(var i=grMem.length;i--;){
      if(grMem[i].grMemEmail==email){
        return filtered=grMem[i].grMemName
      }
    }
    return filtered;
  }
})
