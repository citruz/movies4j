var express = require('express');
var app = express();
var Movie = require('./models/movie');

app.set('neo4j-url', 'http://neo4j:neo5j@localhost:7474');

var bodyParser = require('body-parser')

app.use(bodyParser.json());

app.get('/movies', function(req, res) {
  
  Movie.getAll(200, function (err, movies) {
      if (err) return next(err);
      res.json(movies.map(function(movie) {
        return movie._node.properties;
      }));
  });
  
});

app.get('/movies/search', function(req, res) {
  console.log(req.query.q);
  Movie.search(req.query.q, function (err, movies) {
      if (err) return next(err);
      res.json(movies.map(function(movie) {
        return movie._node.properties;
      }));
  });
  
});

app.listen(process.env.PORT || 8000);