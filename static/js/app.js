'use strict';

/* App Module */

var moviesApp = angular.module('moviesApp', [
  'ngRoute',
  'ngCookies',
  'moviesControllers',
  'moviesDirectives',
  'ui.bootstrap'
]);

moviesApp.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      }).
      when('/', {
        templateUrl: 'templates/main.html',
        controller: 'RecommendationsCtrl'
      }).
      when('/friends', {
        templateUrl: 'templates/friends.html',
        controller: 'FriendsCtrl'
      }).
      when('/movies', {
        templateUrl: 'templates/movies.html',
        controller: 'MoviesCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

moviesApp.run(function($rootScope, $location, $cookieStore) {
  $rootScope.location = $location;

  if ($cookieStore.get('movies4jUser') != undefined) {
    $rootScope.user = {
      name: $cookieStore.get('movies4jUser'),
      id: parseInt($cookieStore.get('movies4jUserId'))
    };
  }

  $rootScope.logout = function() {
    $rootScope.user = null;
    $location.path('/login');
    $cookieStore.remove('movies4jUser');
    $cookieStore.remove('movies4jUserId');
    return false;
  };

  $rootScope.$on( "$routeChangeStart", function(event, next, current) {
    if ($rootScope.user == null) {
      // no logged user, redirect to /login
      if (next.templateUrl != "templates/login.html") {
        $location.path("/login");
      }
    }
  });
});

