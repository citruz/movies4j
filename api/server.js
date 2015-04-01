var express = require('express');
var app = express();

var Movie = require('./models/movie');
var User = require('./models/user');

app.set('neo4j-url', 'http://neo4j:neo5j@localhost:7474');

var bodyParser = require('body-parser')
var methodOverride = require('method-override');
app.use(bodyParser.json());
app.use(methodOverride());

app.get('/movies', function(req, res, next) {

  Movie.getAll(200, function (err, movies) {
      if (err) return next(err);

      res.json(movies.map(function(movie) {
        return movie._node.properties;
      }));

  });
  
});

app.get('/movies/search', function(req, res, next) {
  console.log(req.query.q);
  Movie.search(req.query.q, function (err, movies) {
      if (err) return next(err);
      res.json(movies.map(function(movie) {
        return movie._node.properties;
      }));
  });
  
});

app.post('/movies/:id/ratings', function(req, res, next) {
  if(!req.body.hasOwnProperty('stars') || !req.body.hasOwnProperty('comment') || !req.body.hasOwnProperty('user')) {
    res.statusCode = 400;
    return res.send('Error 400: Post syntax incorrect.');
  } 
  var user = User.getByName(req.body.user, function (err, user) {
    if (err) return next(err);

    Movie.get(req.params.id, function (err, movie) {
      if (err) return next(err);

      movie.addRating(user, req.body.stars, req.body.comment, function (err, result) {
          if (err) return next(err);

          res.json(result);
      });
    });
  });

  
  
});

app.listen(process.env.PORT || 8000);