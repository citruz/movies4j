'use strict';

/* Directives */

var moviesDirectives = angular.module('moviesDirectives', []);

moviesDirectives.directive('movielist', function() {
  return {
    template: '<ul class="movielist">'+
                '<li ng-repeat="movie in movies"><img src="http://img.omdbapi.com/?i={{movie.imdbId}}&apikey=ee8796c8&h=300" /><div>{{movie.title}}</div></li>'+
               '</ul>',
    scope: {
      movies: "=movies"
    }
  };
});