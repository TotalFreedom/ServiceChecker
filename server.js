var http = require('http');
var check = require('./check');
var utils = require('./utils');
var config = require('./config');

var server;

var requestHandler = function (req, res) {

  if (req.url === '/favicon.ico') {
    res.writeHead(404, {'Content-Type': 'image/x-icon'} );
    res.end();
    return;
  }
  
  if (req.url != '/status.json') {
    res.writeHead(404, {'Content-Type': 'text/plain'} );
    res.end("404! Try /status.json");
    return;
  }
  
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify(check.getStatus()));
};

var main = function() {
  server = http.createServer();
  server.listen(config.port, function() {
    utils.log("Server listening on port " + config.port);
  });
  
  server.on('request', requestHandler);
  utils.log("Attached request handler to http server");
  
  setInterval(check.statusCheck, config.interval);
  utils.log("Service check scheduled every " + config.interval/1000 + " seconds");
  statusCheck();
  
};

utils.log("Starting...");
main();
