var neo4j = require('neo4j');
var _ = require('underscore');
var config = require('../config');
var db = new neo4j.GraphDatabase(config.neo4jurl);

// Private Constructor:
var Movie = module.exports = function Movie(_node) {
  this._node = _node;
}

// Public Properties:
Object.defineProperty(Movie.prototype, 'id', {
  get: function () { return this._node._id; }
});

Object.defineProperty(Movie.prototype, 'title', {
  get: function () {
    return this._node.properties['title'];
  },
  set: function (title) {
    this._node.properties['title'] = title;
  }
});

Object.defineProperty(Movie.prototype, 'properties', {
  get: function() { return _.extend(this._node.properties,{id: this._node._id}); }
});

// Public Instance Methods:
Movie.prototype.save = function (callback) {
  this._node.save(function (err) {
    callback(err);
  });
};

Movie.prototype.del = function (callback) {
  var query = [
    'MATCH (movie:Movie)',
    'WHERE ID(movie) = {movieId}',
    'DELETE movie',
    'WITH movie',
    'MATCH (movie) -[rel:follows]- (other)',
    'DELETE rel',
  ].join('\n')

  var params = {
    movieId: this.id
  };

  db.query(query, params, function (err) {
    callback(err);
  });
};

Movie.prototype.addRating = function (user, stars, comment, callback) {
  var query = [
    'MATCH (u:User) WHERE ID(u) = {userid}',
    'MATCH (m:Movie) WHERE ID(m) = {movieid}',
    'CREATE (u)-[:RATED {stars: {stars}, comment: {comment}}]->(m)'
  ].join('\n');

  db.cypher({
    query: query,
    params: {
      userid: user.id,
      movieid: this.id,
      stars: stars,
      comment: comment
    },
  }, function (err, results) {
    if (err) return callback(err);

    callback(null, results);
  });
};
Movie.prototype.removeRating = function (user, callback) {
  var query = [
    'MATCH (u:User)-[r:RATED]-(m:Movie)',
    'WHERE ID(u) = {userid} AND ID(m) = {movieid}',
    'DELETE r'
  ].join('\n');

  db.cypher({
    query: query,
    params: {
      userid: user.id,
      movieid: this.id
    },
  }, function (err, results) {
    if (err) return callback(err);

    callback(null, results);
  });
};


// Public Class Methods:
Movie.get = function (id, callback) {
  db.cypher({
    query: 'MATCH (movie:Movie) WHERE ID(movie) = {id} RETURN movie',
    params: {
      id: parseInt(id)
    },
  }, function (err, results) {
    if (err) return callback(err);
    var movie = new Movie(results[0]['movie']);
    callback(null, movie);
  });
};

Movie.getAll = function (limit, callback) {
  db.cypher({
    query: 'MATCH (movie:Movie) RETURN movie LIMIT {limit}',
    params: {
      limit: limit
    },
  }, function (err, results) {
    if (err) return callback(err);

    var movies = results.map(function (result) {
      return new Movie(result['movie']);
    });
    callback(null, movies);
  });
};

Movie.search = function (title, callback) {
  title = '.*'+title+'.*';
  db.cypher({
    query: 'MATCH (movie:Movie) WHERE LOWER(movie.title) =~ LOWER({title}) RETURN movie ORDER BY movie.title',
    params: {
      title: title
    },
  }, function (err, results) {
    if (err) return callback(err);
    var movies = results.map(function (result) {
      return new Movie(result['movie']);
    });
    callback(null, movies);
  });
};
