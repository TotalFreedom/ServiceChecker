var http = require('http');
var utils = require('./utils');

var status = [
  {"minecraft.net":"green:Online:100.0"},
  {"login.minecraft.net":"green:Online:100.0"},
  {"session.minecraft.net":"green:Online:100.0"},
  {"account.mojang.com":"green:Online:100.0"},
  {"auth.mojang.com":"green:Online:100.0"},
  {"skins.minecraft.net":"green:Online:100.0"},
  {"version": utils.getVersion()},
  {"lastcheck": utils.getUTCTime()}
];

var checks = [];

status.forEach(function (element, index, array) {
  checks.push([]);
});

var getStatus = function () {
  return status;
};
exports.getStatus = getStatus;

var checkService = function (url, caller, index) {
  // Make request
  utils.request(url, function (reply) {
    var stat = utils.parseReply(reply);
    
    if (stat.indexOf("red") !== -1) { // Offline
      checks[index].push(false);
    } else {
      checks[index].push(true);
    }
    var newService = {};
	newService[caller] = stat + utils.calculateUptime(checks[index])
    status[index] = newService;
    utils.log("Updated with " + url);
    utils.log("-> " + status[index][caller].split(":")[1] + " (" + status[index][caller].split(":")[2] + "%)");
  });
};

statusCheck = function (callback) {
  callback = callback || function () {};
  
  status.forEach(function (element, index, array) {
  
    // Minecraft website
    if (element["minecraft.net"]) {
      checkService("http://minecraft.net", "minecraft.net", index);
      return;
    }
    
    // Login server
    if (element["login.minecraft.net"]) {
      checkService("http://login.minecraft.net/session", "login.minecraft.net", index);
      return;
    }
    
    // Session server
    if (element["session.minecraft.net"]) {
      checkService("http://session.minecraft.net/game/joinserver.jsp", "session.minecraft.net", index);
      return;
    }
    
    // Account server
    if (element["account.mojang.com"]) {
      checkService("https://account.mojang.com", "account.mojang.com", index);
      return;
    }
    
    // Account server
    if (element["auth.mojang.com"]) {
      checkService("https://authserver.mojang.com/authenticate", "auth.mojang.com", index);
      return;
    }
    
    // Skins server
    if (element["skins.minecraft.net"]) {
      checkService("http://s3.amazonaws.com/MinecraftSkins/BurningFurnace.png", "skins.minecraft.net", index);
      return;
    }
    
    if (element["lastcheck"]) {
      status[index] = {'lastcheck': utils.getUTCTime()};
    };
    
    
  });
  
  callback(status);
};
exports.statusCheck = statusCheck;
