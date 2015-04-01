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


// static methods:

User.get = function (id, callback) {
    db.cypher({
        query: 'MATCH (user:User {id: {id}}) RETURN user',
        params: {
            id: id
        },
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
        },
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
        },
    }, function (err, results) {
      if (err) return callback(err);
        var user = new User(results[0]['user']);
        console.log(results);
        callback(null, user);
    });
};
// creates the user and persists (saves) it to the db, incl. indexing it:
User.create = function (data, callback) {
    // construct a new instance of our class with the data, so it can
    // validate and extend it, etc., if we choose to do that in the future:
    var node = db.createNode(data);
    var user = new User(node);

    // but we do the actual persisting with a Cypher query, so we can also
    // apply a label at the same time. (the save() method doesn't support
    // that, since it uses Neo4j's REST API, which doesn't support that.)
    var query = [
        'CREATE (user:User {data})',
        'RETURN user',
    ].join('\n');

    var params = {
        data: data
    };

    db.query(query, params, function (err, results) {
        if (err) return callback(err);
        var user = new User(results[0]['user']);
        callback(null, user);
    });
};
