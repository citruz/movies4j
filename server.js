var express = require('express');
var morgan = require('morgan');
var app = express();
var bodyParser = require('body-parser')
var methodOverride = require('method-override');

var config = require('./config');
var Movie = require('./models/movie');
var User = require('./models/user');



app.use(express.static(__dirname + '/static'));
app.use(morgan('combined'));

app.use(bodyParser.json());
app.use(methodOverride());

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');

  next();
}
app.use(allowCrossDomain);

app.get('/api/movies', function(req, res, next) {
  Movie.getAll(200, function (err, movies) {
      if (err) return next(err);

      res.json(movies.map(function(movie) {
        return movie.properties;
      }));

  }); 
});

app.get('/api/movies/search', function(req, res, next) {
  Movie.search(req.query.q, function (err, movies) {
      if (err) return next(err);
      res.json(movies.map(function(movie) {
        return movie.properties;
      }));
  });
  
});

app.post('/api/movies/:id/ratings', function(req, res, next) {
  if(!req.body.hasOwnProperty('stars') || !req.body.hasOwnProperty('comment') || !req.body.hasOwnProperty('user')) {
    res.statusCode = 400;
    return res.send('Error 400: Post syntax incorrect.');
  } 
  User.getByName(req.body.user, function (err, user) {
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

app.delete('/api/users/:userId/ratings/:movieId', function(req, res, next) {
  User.get(req.params.userId, function (err, user) {
    if (err) return next(err);

    Movie.get(req.params.movieId, function (err, movie) {
      if (err) return next(err);

      movie.removeRating(user, function (err, result) {
          if (err) return next(err);

          res.json(result);
      });
    });
  });
});

app.get('/api/users/:id/friends', function(req, res, next) {
  User.get(req.params.id, function (err, user) {
    if (err) return next(err);
    
    user.getFriends(function (err, friends) {
      if (err) return next(err);
      res.json(friends.map(function(friend) {
        return friend.properties;
      }));
    });
  });
  
});

app.get('/api/users/:id/ratings', function(req, res, next) {
  User.get(req.params.id, function (err, user) {
    if (err) return next(err);
    
    user.getRatings(function (err, ratingsAndMovies) {
      if (err) return next(err);

      res.json(ratingsAndMovies);
    });
  });
  
});

app.post('/api/users', function(req, res, next) {
  if(!req.body.hasOwnProperty('username')) {
    res.statusCode = 400;
    return res.send('Error 400: Post syntax incorrect.');
  }
  User.getByName(req.body.username, function (err, user) {
    if (err) return next(err);

    if (user) {
      res.json(user.properties);
    } else {
      User.create(req.body.username, function (err, user) {
        if (err) return next(err);
        res.json(user.properties);
      }); 
    }
  });

  
});

app.get('/api/users/search', function(req, res, next) {
  User.search(req.query.q, function (err, users) {
      if (err) return next(err);

      res.json(users.map(function(user) {
        return user.properties;
      }));
  });
  
});

app.post('/api/users/:userid/friends/:friendid', function(req, res, next) {
  var userid = req.params.userid;
  var friendid = req.params.friendid;
  User.get(userid, function (err, user) {
    if (err) return next(err);
    
      User.get(friendid, function (err, friend) {
        if (err) return next(err);

        user.addFriend(friend,function (err, friend) {
          if (err) return next(err);

          res.json(friend.properties);
        });  
      });
  });
  
});

app.delete('/api/users/:userid/friends/:friendid', function(req, res, next) {
  var userid = req.params.userid;
  var friendid = req.params.friendid;
  User.get(userid, function (err, user) {
    if (err) return next(err);
    
      User.get(friendid, function (err, friend) {
        if (err) return next(err);

        user.removeFriend(friend,function (err, friend) {
          if (err) return next(err);

          res.json(friend.properties);
        });  
      });
  });
  
});

app.get('/api/users/:userid/similarMovies', function(req, res, next) {
  User.get(req.params.userid, function (err, user) {
    if (err) return next(err);
    
    user.getSimilarMovies(function (err, movies) {
      if (err) return next(err);

      res.json(movies.map(function(movie){
        return movie.properties;
      }));
    });
  });
});

app.get('/api/users/:userid/friendsMovies', function(req, res, next) {
  User.get(req.params.userid, function (err, user) {
    if (err) return next(err);
    
    user.getFriendsMovies(function (err, movies) {
      if (err) return next(err);

      res.json(movies.map(function(movie){
        return movie.properties;
      }));
    });
  });
});


var server = app.listen(process.env.PORT || config.port, function() {
  console.log("Server listening on port %d.", server.address().port);
});