'use strict';

/* Controllers */

var moviesControllers = angular.module('moviesControllers', []);

var rootURL = "http://localhost:8000/api";

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
    $scope.getFriends = function() {
      $http.get(rootURL+'/users/'+$rootScope.user.id+'/friends').
      success(function(data, status, headers, config) {
        $scope.friends = data;
      }).
      error(function(data, status, headers, config) {
        alert('Error loading friends.');
      });
    }
    $scope.getFriends();

    //Get movies
    //TODO
    $scope.getMovies = function() {
      $http.get(rootURL+'/users/'+$rootScope.user.id+'/friends').
      success(function(data, status, headers, config) {
        $scope.movies = data;
      }).
      error(function(data, status, headers, config) {
        alert('Error loading movies.');
      });
    }
    $scope.getMovies();

    //Get similar movies
    $scope.getSimilarMovies = function() {
      $http.get(rootURL+'/users/'+$rootScope.user.id+'/similarMovies').
      success(function(data, status, headers, config) {
        $scope.similarMovies = data;
      }).
      error(function(data, status, headers, config) {
        alert('Error loading similarmovies.');
      });
    }
    $scope.getSimilarMovies();

    //Get friends movies
    $scope.getFriendsMovies = function() {
      $http.get(rootURL+'/users/'+$rootScope.user.id+'/friendsMovies').
      success(function(data, status, headers, config) {
        $scope.friendsMovies = data;
      }).
      error(function(data, status, headers, config) {
        alert('Error loading friends movies.');
      });
    }
    $scope.getFriendsMovies();

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
    };

    $scope.rateMovie = function(movie) {
      $scope.selectedMovie = movie;
      $scope.newRating = {};
      $('#rate-modal').modal('show');
      return false;
    };
    $scope.hoveringOver = function(value) {
      $scope.overStar = value;
      $scope.percent = 100 * (value / 5);
    };
    $scope.submitRating = function(movie, rating) {
      var submit = $.extend(rating, {user: $rootScope.user.name});
      $http.post(rootURL+'/movies/'+$scope.selectedMovie.id+'/ratings', submit).
        success(function(data, status, headers, config) {
          $('#rate-modal').modal('hide');
          getMovies();
        }).
        error(function(data, status, headers, config) {
          alert('Error saving rating.');
        }); 
    };

  }]);