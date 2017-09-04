var fs = require('fs');
var async = require('async');
var glob = require('glob');
var ini = require('ini');

// Entourage Warning
if (typeof process.env.ENTOURAGE_KEY === 'undefined') {
	console.log("Warning you have not defined your ENTOURAGE_KEY env secret. Try export ENTOURAGE_KEY=testing_a_secret_key");
}
var encryptor = require('simple-encryptor')({ key: process.env.ENTOURAGE_KEY});

var encrypt = function(data) {
  return encryptor.encrypt(data);
}

var decrypt = function(data) {
  return encryptor.decrypt(data);
}

var generate = function(globPattern, fileExt, cb) {
  glob(globPattern, function(err, files) {
  	async.each(files, function(file, callback) {
  	  var fileExtension = file.split('.');
  	  fileExtension = '.'+fileExtension[fileExtension.length-1];
  	  fs.writeFileSync(file.replace(fileExtension, '')+fileExt, encrypt(fs.readFileSync(file, 'utf-8')), 'utf-8');
  	  callback();
  	}, function(err) {
  	  if (err) {
  	  	console.log('Entourage Config Error ::', err);
  	  }
  	  cb();
  	});
  });
}

var config = function(globPattern, cb) {
  glob(globPattern, function(err, files) {
  	async.each(files, function(file, callback) {
  	  var envIni = ini.parse(decrypt(fs.readFileSync(file, 'utf-8')));
  	  for (inival in envIni) {
  	  	if (!process.env.hasOwnProperty(inival)) {
  	  	  process.env[''+ inival +''] = envIni[inival];
  	  	}
  	  }
  	  callback();
  	}, function(err) {
  	  if (err) {
  	  	console.log('Entourage Config Error ::', err);
  	  }
  	  cb();
  	});
  });
}

module.exports = {
  generate: generate,
  config: config
}