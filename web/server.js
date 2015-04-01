var express = require('express');
var morgan = require('morgan');
var app = express();

app.use(express.static(__dirname + '/static'));
app.use(morgan('combined'))

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on port " + port);
});