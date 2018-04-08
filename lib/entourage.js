var fs = require('fs');
var async = require('async');
var glob = require('glob');
var ini = require('ini');
var path = require('path');
var debug = require('debug')('lib/entourage.js');

var warningExit = function() {
  // Entourage Warning
  if (typeof process.env.ENTOURAGE_KEY === 'undefined') {
    console.log("Warning you have not defined your ENTOURAGE_KEY env secret. Try export ENTOURAGE_KEY=testing_a_secret_key");
    process.exit(1);
  }
}

var encryptor = function(key) {
  return require('simple-encryptor')({ key: key || process.env.ENTOURAGE_KEY});
}

var encrypt = function(key, data) {
  return encryptor(key || null).encrypt(data);
}

var decrypt = function(key, data) {
  return encryptor(key || null).decrypt(data);
}

var generate = function(globPattern, fileExt, cb) {
  warningExit();
  glob(globPattern, function(err, files) {
  	async.each(files, function(file, callback) {
      file = path.resolve(file);
  	  var fileExtension = file.split('.');
  	  fileExtension = '.'+fileExtension[fileExtension.length-1];
      var outputEnt = file.replace(fileExtension, '')+fileExt;
  	  fs.writeFileSync(outputEnt, encrypt(null, fs.readFileSync(file, 'utf-8')), 'utf-8');
      debug('Wrote Entourage File:', outputEnt);
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
  warningExit();
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
        if (fs.existsSync(file.replace('.ent','.env'))) {
          debug('Unlinking:', file.replace('.ent','.env'));
          fs.unlinkSync(file.replace('.ent','.env'));
        }
      }
      var decryptData = decrypt(null, fs.readFileSync(file, 'utf-8'));
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
  config: config,
  generate: generate,
  encrypt: encrypt,
  decrypt: decrypt
}