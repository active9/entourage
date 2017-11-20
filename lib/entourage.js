var fs = require('fs');
var async = require('async');
var glob = require('glob');
var ini = require('ini');

// Entourage Warning
if (typeof process.env.ENTOURAGE_KEY === 'undefined') {
	console.log("Warning you have not defined your ENTOURAGE_KEY env secret. Try export ENTOURAGE_KEY=testing_a_secret_key");
  process.exit(1);
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

var config = function(globPattern, options, cb) {
  // Strict Means it will delete any .env files found with the same name of the ini file in the same folder
  var strict = false;

  // Detect Options (With Legacy Format Support)
  if (typeof options !=='function') {
    if (options.strict) {
      strict = true;
    }
  } else {
    cb = options;
  }
  glob(globPattern, function(err, files) {
  	async.each(files, function(file, callback) {
      if (strict) {
        fs.unlinkSync(file.replace('.ent','.env'));
      }
      var decryptData = decrypt(fs.readFileSync(file, 'utf-8'));
      if (decryptData) {
    	  var envIni = ini.parse(decryptData);
    	  for (inival in envIni) {
    	  	if (!process.env.hasOwnProperty(inival)) {
    	  	  process.env[''+ inival +''] = envIni[inival];
    	  	}
    	  }
  	   callback();
     } else {
      callback();
     }
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