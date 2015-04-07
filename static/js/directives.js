'use strict';

/* Directives */

var moviesDirectives = angular.module('moviesDirectives', []);

moviesDirectives.directive('movielist', function() {
  return {
    template: '<ul class="movielist">'+
                '<li ng-repeat="movie in movies">'+
                	'<a href="http://imdb.com/title/{{movie.imdbId}}/" target="_blank"><img ng-src="http://img.omdbapi.com/?i={{movie.imdbId}}&apikey=ee8796c8&h=300" /></a>'+
                	'<div><a href="http://imdb.com/title/{{movie.imdbId}}/" target="_blank">{{movie.title}}</a></div>'+
            	'</li>'+
              '</ul>',
    scope: {
      movies: "=movies"
    }
  };
});