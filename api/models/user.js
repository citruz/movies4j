var neo4j = require('neo4j');
var db = new neo4j.GraphDatabase('http://neo4j:neo5j@localhost:7474');

// private constructor:

var User = module.exports = function User(_node) {
    this._node = _node;
}

// public instance properties:

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

// public instance methods:

User.prototype.save = function (callback) {
    this._node.save(function (err) {
        callback(err);
    });
};

User.prototype.del = function (callback) {
    // use a Cypher query to delete both this user and his/her following
    // relationships in one transaction and one network request:
    // (note that this'll still fail if there are any relationships attached
    // of any other types, which is good because we don't expect any.)
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
		
		console.log(results);
        var users = results.map(function (result) {
            return new User(result['friend']);
        });
        callback(null, users);
    });
	

};
// static methods:

User.get = function (id, callback) {
    db.cypher({
        query: 'MATCH (user:User) WHERE ID(user)={id} RETURN user',
        params: {
            id: parseInt(id)
        }
    }, function (err, results) {
      if (err) return callback(err);
        var user = new User(results[0]['user']);
        callback(null, user);
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
        var user = new User(results[0]['user']);
        console.log(results);
        callback(null, user);
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
        console.log(results);
        callback(null, user);
    });
};

User.setFriend = function (ida, idb, callback) {
	db.cypher({
		query: 'MATCH (a:User),(b:User) CREATE (a)-[r:KNOWS]->(b) WHERE ID(a)={ida} AND ID(b)={idb} RETURN r',
		params: {
			ida: parseInt(ida),
			idb: parseInt(idb)			
		}
	}, function (err, results) {
      if (err) return callback(err);
        var user = new User(results[0]['user']);
        console.log(results);
        callback(null, user);
    });
}