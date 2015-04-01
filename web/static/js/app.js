'use strict';

/* App Module */

var moviesApp = angular.module('moviesApp', [
  'ngRoute',

  'moviesControllers'
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
        controller: 'MainCtrl'
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

moviesApp.run(function($rootScope, $location) {
    $rootScope.$on( "$routeChangeStart", function(event, next, current) {
      if ($rootScope.loggedInUser == null) {
        // no logged user, redirect to /login
        if ( next.templateUrl === "templates/login.html") {
        } else {
          $location.path("/login");
        }
      }
    });
  });