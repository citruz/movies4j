# Movies4j - Movie Recommendation Engine
Movies4j is an example application for the usage of Graph Databases, specifically of Neo4j. It is targeted at beginners who want to learn about the benefits of Graph Databases and their use cases. It shows the simplicity of the Neo4j and the Cypher Query Language. If you are interested, learn more about them on [neo4j.com](http://neo4j.com/).

The application allows users to rate movies they like and add other users as their friends. Based on this information, users will receive recommendations for other movies, they might like as well and movies that their friends like.

![Screenshot](http://fs2.directupload.net/images/150514/5p45pfg4.jpg)

## Architecture
* Web Front-End based on [AngularJS](https://github.com/angular/angular.js)
* REST-API Server based on [Node.js](https://github.com/joyent/node) with [Express](https://github.com/strongloop/express) and [Node-Neo4j](https://github.com/thingdom/node-neo4j)
* Neo4j Database

## Installation
* Download Neo4j Community Edition from http://neo4j.com/ ([Manual](http://neo4j.com/docs/stable/server-installation.html))
* Unzip the contents of `db/graph.db.zip` to `neo-install-dir/data/graph.db`
* Start Neo4j `./bin/neo4j start`
* Open your browser at [http://localhost:7474](http://localhost:7474), login with neo4j/neo4j and change the password to `neo5j` (feel free to use a different password, but then you need to change the connection url in `config.js` accordingly)
* Run `npm install` in the repo's main directory
* Run `npm start` to start the server
* Open your browser at [http://localhost:8000](http://localhost:8000)

##Algorithms
Probably one of the most interesting parts of the application are the algorithms that are used to determine recommendations. You can have a look at them in `models/user.js` (`getSimilarMovies` and `getFriendsMovies` are the important methods).

###Similar Movies
```
MATCH (me:User)-[r1:RATED]->(m:Movie)<-[r2:RATED]-(u:User)-[r3:RATED]->(m2:Movie)
WHERE ID(me) = {userid} AND r1.stars > 3 AND r2.stars > 3 AND r3.stars > 3 AND NOT (me)-[:RATED]->(m2)
RETURN distinct m2 AS movie, count(*) AS count
ORDER BY count DESC
LIMIT 10
````
Explanation: Look for users who rated movies with three or more stars, that I have rated high as well. Which movies did these users liked additionally and I haven't seen yet?

###Friends Movies
```
MATCH (me:User)-[:FRIEND]-(f), (f)-[r:RATED]-(m:Movie)
WHERE ID(me) = {userid} AND r.stars > 3 AND NOT (me)-[:RATED]->(m)
RETURN distinct m AS movie, count(*) AS count
ORDER BY count DESC
LIMIT 10
````
Explanation: From all of my friends, which movies did they rated high and I haven't seen yet?
