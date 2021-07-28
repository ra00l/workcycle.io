var express = require('express');
var app = express();

// http://stackoverflow.com/questions/14322989/first-heroku-deploy-failed-error-code-h10
// Heroku dynamically assigns your app a port, so you can't set the port to a fixed number.
// Heroku adds the port to the env, so you can pull it from there

// set the port for the server
app.set('port', (process.env.PORT || 5000));

// set static folder
app.use(express.static(__dirname + '/build'));

// any route that is called will respond with index.html
app.get('/*', function(req, res) {
  res.sendFile(__dirname + '/build/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
