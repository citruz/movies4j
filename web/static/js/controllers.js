'use strict';

/* Controllers */

var moviesControllers = angular.module('moviesControllers', []);

moviesControllers.controller('LoginCtrl', ['$scope', '$location', '$rootScope',
  function($scope, $location, $rootScope) {
    $scope.login = function() {
      $rootScope.loggedInUser = $scope.user;
      $location.path("/");

      return false;
    };

  }]);

moviesControllers.controller('MainCtrl', ['$scope', 
  function($scope) {

  }]);