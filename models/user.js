var neo4j = require('neo4j');
var _ = require('underscore');
var Movie = require('./movie.js');
var config = require('../config');
var db = new neo4j.GraphDatabase(config.neo4jurl);

// Private Constructor:
var User = module.exports = function User(_node) {
  this._node = _node;
}

// Public Properties:
Object.defineProperty(User.prototype, 'id', {
  get: function () { return this._node._id; }
});

Object.defineProperty(User.prototype, 'name', {
  get: function () {
    return this._node.properties['name'];
  },
  set: function (name) {
    this._node.properties['name'] = name;
  }
});

Object.defineProperty(User.prototype, 'properties', {
  get: function() { return _.extend(this._node.properties,{id: this._node._id}); }
});

// Public Instance Methods:
User.prototype.save = function (callback) {
  this._node.save(function (err) {
    callback(err);
  });
};

User.prototype.del = function (callback) {
  var query = [
    'MATCH (user:User)',
    'WHERE ID(user) = {userId}',
    'DELETE user',
    'WITH user',
    'MATCH (user) -[rel:follows]- (other)',
    'DELETE rel',
  ].join('\n')

  var params = {
    userId: this.id
  };

  db.query(query, params, function (err) {
    callback(err);
  });
};

User.prototype.getFriends = function (callback) {
  db.cypher({
    query: 'MATCH (n:User)-[:FRIEND]->(friend:User) WHERE ID(n)={id} return friend',
    params: {
      id: this.id
    },
  }, function (err, results) {
    if (err) return callback(err);

    var users = results.map(function (result) {
      return new User(result['friend']);
    });
    callback(null, users);
  });
  

};

User.prototype.getSimilarMovies = function (callback) {
  var query = [
    'MATCH (me:User)-[r1:RATED]->(m:Movie)<-[r2:RATED]-(u:User)-[r3:RATED]->(m2:Movie)',
    'WHERE ID(me) = {userid} AND r1.stars > 3 AND r2.stars > 3 AND r3.stars > 3 AND NOT (me)-[:RATED]->(m2)',
    'return distinct m2 AS movie, count(*) AS count',
    'Order BY count DESC',
    'LIMIT 10'
  ].join('\n');
  db.cypher({
    query: query,
    params: {
      userid: this.id
    },
  }, function (err, results) {
    if (err) return callback(err);

    var users = results.map(function (result) {
      return new User(result['movie']);
    });
    callback(null, users);
  });   
};

User.prototype.getFriendsMovies = function (callback) {
  var query = [
    'MATCH (me:User)-[:FRIEND]-(f), (f)-[r:RATED]-(m:Movie)',
    'WHERE ID(me) = {userid} AND r.stars > 3 AND NOT (me)-[:RATED]->(m)', 
    'return distinct m AS movie, count(*) AS count',
    'Order BY count DESC',
    'LIMIT 10'
  ].join('\n');
  db.cypher({
    query: query,
    params: {
      userid: this.id
    },
  }, function (err, results) {
    if (err) return callback(err);

    var users = results.map(function (result) {
      return new User(result['movie']);
    });
    callback(null, users);
  });   
}
User.prototype.addFriend = function (friend, callback) {
  db.cypher({
    query: 'MATCH (a:User),(b:User) WHERE ID(a)={ida} AND ID(b)={idb} CREATE (a)-[r:FRIEND]->(b) CREATE (a)<-[r2:FRIEND]-(b) RETURN b',
    params: {
      ida: this.id,
      idb: friend.id          
    }
  }, function (err, results) {
    if (err) return callback(err);

    callback(null, friend);
  });
}
User.prototype.removeFriend = function (friend, callback) {
  db.cypher({
    query: 'MATCH (a:User)-[r:FRIEND]-(b:User) WHERE ID(a)={ida} AND ID(b)={idb} DELETE r',
    params: {
      ida: this.id,
      idb: friend.id          
    }
  }, function (err, results) {
    if (err) return callback(err);

    callback(null, friend);
  });
}

User.prototype.getRatings = function(callback) {
    db.cypher({
    query: 'MATCH (n:User)-[r:RATED]->(movie:Movie) WHERE ID(n)={id} return r, movie',
    params: {
      id: this.id
    },
  }, function (err, results) {
    if (err) return callback(err);

    var ratingsAndMovies = results.map(function (result) {
      return { 
        stars: result['r'].properties.stars, 
        comment: result['r'].properties.comment, 
        movie: new Movie(result['movie']).properties
      };
    });
    callback(null, ratingsAndMovies);
  });
  
}


// Public Class Methods:
User.get = function (id, callback) {
  db.cypher({
    query: 'MATCH (user:User) WHERE ID(user)={id} RETURN user',
    params: {
      id: parseInt(id)
    }
  }, function (err, results) {
    if (err) return callback(err);

    if (Array.isArray(results) && results.length > 0) {
      var user = new User(results[0]['user']);
      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};

User.getAll = function (limit, callback) {
  db.cypher({
    query: 'MATCH (user:User) RETURN user LIMIT {limit}',
    params: {
      limit: limit
    }
  }, function (err, results) {
    if (err) return callback(err);
    var users = results.map(function (result) {
      return new User(result['user']);
    });
    callback(null, users);
  });
};

User.getByName = function (name, callback) {
  db.cypher({
    query: 'MATCH (user:User {name: {name}}) RETURN user',
    params: {
      name: name
    }
  }, function (err, results) {
    if (err) return callback(err);

    if (Array.isArray(results) && results.length > 0) {
      var user = new User(results[0]['user']);
      callback(null, user);
    } else {
      callback(null, null);
    }
  });
};
User.search = function (name, callback) {
  name = '.*'+name+'.*';
  db.cypher({
    query: 'MATCH (user:User) WHERE LOWER(user.name) =~ LOWER({name}) RETURN user',
    params: {
      name: name
    },
  }, function (err, results) {
    if (err) return callback(err);
    var users = results.map(function (result) {
      return new User(result['user']);
    });
    callback(null, users);
  });
};

User.create = function (name, callback) {
   db.cypher({
    query: 'CREATE (user:User {name: {name}}) RETURN user',
    params: {
      name: name
    },
  }, function (err, results) {
    if (err) return callback(err);
    var user = new User(results[0]['user']);
    callback(null, user);
  });
};

