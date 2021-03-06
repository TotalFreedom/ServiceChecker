var moment = require('moment');
var http = require('http');
var https = require('https');
var url = require('url');
var config = require('./config');

var getUTCTime = function () {
  return moment.utc().format("HH:mm:ss") + " UTC";
};
exports.getUTCTime = getUTCTime;

var log = function (text, level) {
  console.log("[" + (level || "INFO").toUpperCase() + "] " + getUTCTime() + " - " + text); 
};
exports.log = log;

var parseReply = function (code) {
  switch (code) {
    case 200:
      return "green:Online:";
      break;
    case 405:
      return "green:Online:";
      break;
    case 400:
      return "green:Online:";
      break;
    case 503:
      return "red:Offline:";
      break;
    case 500:
      return "red:Error 500:";
      break;
    case 404:
      return "red:Error 404:";
      break;
    case "timeout":
      return "red:Timeout:";
      break;
    case "slow":
      return "yellow:Quite Slow:";
      break;
    case "error":
      return "red:Offline:";
      break;
    default:
      return "yellow:Unknown (" + code + "):";
      break;
  };
};
exports.parseReply = parseReply;

var calculateUptime = function (uptime) {
  if (uptime.length == 0) {
    return 100.0;
  }

  var val = 0;
  for (var i = 0; i < uptime.length; i++) {
    if (uptime[i]) {
      val += 100;
    }
  }
  
  return (val/uptime.length).toFixed(1); // One decimal
  
};
exports.calculateUptime = calculateUptime;

var request = function (address, callback) {
  var hasCalled = false; // Callback status
  var secure = (url.parse(address).protocol == "https:");
  
  if (!address) {
    return false;
  }
  
  var options = {
    'hostname': url.parse(address).host,
    'port': (secure ? 443 : 80),
    'path': url.parse(address).path,
    'method': 'GET'
  };
  
  var req = (secure ? https : http).request(options, function (res) {
    if (hasCalled) {
      return;
    }
    var buffer = "";
    
    res.setEncoding('utf8');
    
    res.on('data', function (chunk) {
      buffer += chunk;
    });
    
    res.on('end', function () {
      hasCalled = true;
      callback(res.statusCode, buffer, res.headers);
    });
    
  
  });
  
  req.on('socket', function (socket) {
    socket.setTimeout(config.timeout);
    
    socket.on('timeout', function() {
      if (hasCalled) {
        return;
      }
      hasCalled = true;
      callback('timeout', false);
      req.abort();
    });
    
    req.on('error', function(e) {
      if (hasCalled) {
        return;
      }
      hasCalled = true;
      callback('error', false);
      req.abort();
    });
    
  });
  req.end();
  

};
exports.request = request;
