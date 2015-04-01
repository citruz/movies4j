'use strict';

/* Controllers */

var moviesControllers = angular.module('moviesControllers', []);

var rootURL = "http://localhost:8000";

moviesControllers.controller('LoginCtrl', ['$scope', '$location', '$rootScope', '$http',
  function($scope, $location, $rootScope, $http) {

    $scope.login = function() {
      if ($scope.username.trim() == '') return;
      
      $http.post(rootURL+'/users', {username: $scope.username}).
        success(function(data, status, headers, config) {
          $rootScope.user = data;
          $location.path("/");
        }).
        error(function(data, status, headers, config) {
          alert('Error logging in.');
        });
      return false;
    };

  }]);

moviesControllers.controller('MainCtrl', ['$scope', '$rootScope', '$location', '$http',
  function($scope, $rootScope, $location, $http) {

    //Get friends
    var getFriends = function() {
      $http.get(rootURL+'/users/'+$rootScope.user.id+'/friends').
      success(function(data, status, headers, config) {
        $scope.friends = data;
      }).
      error(function(data, status, headers, config) {
        alert('Error loading friends.');
      });
    }
    getFriends();

    $scope.logout = function() {
      $rootScope.user = null;
      $location.path('/login');
      return false;
    }

    $scope.searchFriends = function() {
      $http.get(rootURL+'/users/search?q='+$scope.friendSearchName).
        success(function(data, status, headers, config) {
          $scope.friendsearch = data.filter(function(friend) {
            return (friend.id != $rootScope.user.id);
          });
        })
    }

    $scope.addFriend = function(friend) {
      $http.post(rootURL+'/users/'+$rootScope.user.id+'/friends/'+friend.id).
        success(function(data, status, headers, config) {
          getFriends();
        });
      return false;
    }

    $scope.searchMovies = function() {
      if ($scope.movieSearchTitle.length == 0) {
        $scope.moviesearch = null;
        return;
      }
      if ($scope.movieSearchTitle.length < 3) return;

      $http.get(rootURL+'/movies/search?q='+$scope.movieSearchTitle).
        success(function(data, status, headers, config) {
          $scope.moviesearch = data;
        })
    }

  }]);