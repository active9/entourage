var fs = require('fs');
var async = require('async');
var glob = require('glob');
var ini = require('ini');
var path = require('path');
var debug = require('debug')('lib/entourage.js');

/**
 * Displays a warning message to the console log if the ENTOURAGE_KEY is not set
 * @function
 */
var warningExit = function() {
  // Entourage Warning
  if (typeof process.env.ENTOURAGE_KEY === 'undefined') {
    console.log("Warning you have not defined your ENTOURAGE_KEY env secret. Try export ENTOURAGE_KEY=testing_a_secret_key");
    process.exit(1);
  }
}

/**
 * The encryptor key handler function to process the ENTOURAGE_KEY
 * @function
 * @param {string} key - The ENTOURAGE_KEy value.
 */
var encryptor = function(key) {
  return require('simple-encryptor')({ key: key || process.env.ENTOURAGE_KEY});
}

/**
 * Encrypt function using the ENTOURAGE_KEY to encrypt data. In this case the data is the env file contents.
 * @function
 * @param {string} key - The ENTOURAGE_KEy value.
 * @param {string} data - The raw env file data.
 */
var encrypt = function(key, data) {
  return encryptor(key || null).encrypt(data);
}

/**
 * Decrypt function using the ENTOURAGE_KEY to decrypt data. In this case the data is the ent file contents.
* @function
 * @param {string} key - The ENTOURAGE_KEy value.
 * @param {string} data - The encrypted ent file data.
 */
var decrypt = function(key, data) {
  return encryptor(key || null).decrypt(data);
}

/**
 * Entourage ent files generator which looks for multiple .env files in the glob pattern passed to the function. * @function
 * @param {string} globPattern - The glob file pattern (see the npm module glob for pattern help).
 * @param {string} fileExt - The file extension to match.
 * @param {function} cb - The Callback handler which has no return values.
 */
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

/**
 * Decryption function helper that takes ent files and decrypts them then reads their content. The strict option
 * deletes all .env files found from the globPattern after the .ent file is generated.
 * @param {string} globPattern - The glob file pattern (see the npm module glob for pattern help).
 * @param {string} options - The options object.
 * @param {function} cb - The Callback handler which has no return values.
 */
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