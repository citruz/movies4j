# Movies4j - Movie Recommendation Engine
Movies4j is an example application for the usage of Graph Databases. ^It is targeted at beginners who want to learn about the benefits of Graph Databases and their use cases. 

The application allows users to rate movies they like and add other users as their friends. Based on this information, users will receive recommendations for other movies, they might like as well and movies that their friends like.

## Architecture
* Web Front-End based on AngularJS
* REST-API Server based on Node.js with Express and Node-Neo4j
* Neo4j Database

## Installation
* Download Neo4j Community Edition from http://neo4j.com/ ([Manual](http://neo4j.com/docs/stable/server-installation.html))
* Unzip the contents of `db/graph.db.zip` to `neo-install-dir/data/graph.db`
* Start Neo4j `./bin/neo4j start`
* Open your browser at [http://localhost:7474](http://localhost:7474), login with neo4j/neo4j and change the password to `neo5j`
* Run `npm install` in the repo's main directory
* Run `npm start` to start the server
* Open your browser at [http://localhost:8000](http://localhost:8000)

