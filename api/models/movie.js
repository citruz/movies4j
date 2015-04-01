var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:neo5j@localhost:7474');

// private constructor:

var Movie = module.exports = function Movie(_node) {
    this._node = _node;
}

// public instance properties:

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

// public instance methods:

Movie.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

Movie.prototype.del = function (callback) {
    // use a Cypher query to delete both this movie and his/her following
    // relationships in one transaction and one network request:
    // (note that this'll still fail if there are any relationships attached
    // of any other types, which is good because we don't expect any.)
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

        console.log("Add rating: ");
        console.log(results);

        callback(null, results);
    });
};


// static methods:

Movie.get = function (id, callback) {
    db.cypher({
        query: 'MATCH (movie:Movie {id: {id}}) RETURN movie',
        params: {
            id: id
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
    db.cypher({
        query: 'MATCH (movie:Movie {title: {title}}) RETURN movie',
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
// creates the movie and persists (saves) it to the db, incl. indexing it:
Movie.create = function (data, callback) {
    // construct a new instance of our class with the data, so it can
    // validate and extend it, etc., if we choose to do that in the future:
    var node = db.createNode(data);
    var movie = new Movie(node);

    // but we do the actual persisting with a Cypher query, so we can also
    // apply a label at the same time. (the save() method doesn't support
    // that, since it uses Neo4j's REST API, which doesn't support that.)
    var query = [
        'CREATE (movie:Movie {data})',
        'RETURN movie',
    ].join('\n');

    var params = {
        data: data
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var movie = new Movie(results[0]['movie']);
        callback(null, movie);
    });
};
