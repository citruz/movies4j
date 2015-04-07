'use strict';

/* Controllers */

var moviesControllers = angular.module('moviesControllers', []);

var rootURL = "/api";

moviesControllers.controller('LoginCtrl', ['$scope', '$location', '$rootScope', '$http', '$cookieStore',
  function($scope, $location, $rootScope, $http, $cookieStore) {

    $scope.login = function() {
      if ($scope.username.trim() == '') return;
      
      $http.post(rootURL+'/users', {username: $scope.username}).
        success(function(data, status, headers, config) {
          $rootScope.user = data;

          $cookieStore.put('movies4jUser', data.name);
          $cookieStore.put('movies4jUserId', data.id+'');

          $location.path("/");
        }).
        error(function(data, status, headers, config) {
          alert('Error logging in.');
        });
      return false;
    };

  }]);

moviesControllers.controller('RecommendationsCtrl', ['$scope', '$rootScope', '$location', '$http',
  function($scope, $rootScope, $location, $http, $cookieStore) {
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
  }]);

moviesControllers.controller('MoviesCtrl', ['$scope', '$rootScope', '$location', '$http',
  function($scope, $rootScope, $location, $http, $cookieStore) {
    //Get movies
    $scope.getMovies = function() {
      $http.get(rootURL+'/users/'+$rootScope.user.id+'/ratings').
      success(function(data, status, headers, config) {
        $scope.ratings = data;
      }).
      error(function(data, status, headers, config) {
        alert('Error loading ratings.');
      });
    }
    $scope.getMovies();

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
      $scope.newRating = { stars: undefined, comment: ''};
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
          $scope.getMovies();
        }).
        error(function(data, status, headers, config) {
          alert('Error saving rating.');
        }); 
    };
    $scope.removeRating = function(movie) {
      $http.delete(rootURL+'/users/'+$rootScope.user.id+'/ratings/'+movie.id).
        success(function(data, status, headers, config) {
          $scope.getMovies();
        }).
        error(function(data, status, headers, config) {
          alert('Error deleting rating.');
        }); 
    };

  }]);

moviesControllers.controller('FriendsCtrl', ['$scope', '$rootScope', '$location', '$http',
  function($scope, $rootScope, $location, $http, $cookieStore) {
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
          $scope.getFriends();
          $scope.friendSearchName = '';
          $scope.friendsearch = [];
        });
      return false;
    }
    $scope.removeFriend = function(friend) {
      $http.delete(rootURL+'/users/'+$rootScope.user.id+'/friends/'+friend.id).
        success(function(data, status, headers, config) {
          $scope.getFriends();
        });
      return false;
    }

  }]);