const fs = require('fs');
const async = require('async');
const glob = require('glob');
const ini = require('ini');
const path = require('path');
const debug = require('debug')('lib/entourage.js');

/**
 * Displays a warning message to the console log if the ENTOURAGE_KEY is not set
 * @function
 */
const warningExit = () => {
  // Entourage Warning
  if (typeof process.env.ENTOURAGE_KEY === 'undefined') {
    console.log('Warning you have not defined your ENTOURAGE_KEY env secret. Try export ENTOURAGE_KEY=testing_a_secret_key');
    process.exit(1);
  }
};

/**
 * The encryptor key handler function to process the ENTOURAGE_KEY
 * @function
 * @param {string} key - The ENTOURAGE_KEy value.
 */
const encryptor = (key) => require('simple-encryptor')({ key: key || process.env.ENTOURAGE_KEY });

/**
 * Encrypt function using the ENTOURAGE_KEY to encrypt data. In this case the data is the env file contents.
 * @function
 * @param {string} key - The ENTOURAGE_KEy value.
 * @param {string} data - The raw env file data.
 */
const encrypt = (key, data) => encryptor(key || null).encrypt(data);

/**
 * Decrypt function using the ENTOURAGE_KEY to decrypt data. In this case the data is the ent file contents.
 * @function
 * @param {string} key - The ENTOURAGE_KEy value.
 * @param {string} data - The encrypted ent file data.
 */
const decrypt = (key, data) => encryptor(key || null).decrypt(data);

/**
 * Entourage ent files generator which looks for multiple .env files in the glob pattern passed to the function. * @function
 * @param {string} globPattern - The glob file pattern (see the npm module glob for pattern help).
 * @param {string} fileExt - The file extension to match.
 * @param {function} cb - The Callback handler which has no return values.
 */
const generate = (globPattern, fileExt, cb) => {
  warningExit();
  glob(globPattern, (err, files) => {
    if (err) {
      console.log('Entourage Generate Error:', globPattern, fileExt, err);
    }
    async.each(
      files,
      (file, callback) => {
        file = path.resolve(file);
        let fileExtension = file.split('.');
        fileExtension = '.' + fileExtension[fileExtension.length - 1];
        const outputEnt = file.replace(fileExtension, '') + fileExt;
        fs.writeFileSync(outputEnt, encrypt(null, fs.readFileSync(file, 'utf-8')), 'utf-8');
        debug('Wrote Entourage File:', outputEnt);
        callback();
      },
      (err) => {
        if (err) {
          console.log('Entourage Config Error ::', err);
        }
        cb();
      }
    );
  });
};

/**
 * Decryption function helper that takes ent files and decrypts them then reads their content. The strict option
 * deletes all .env files found from the globPattern after the .ent file is generated.
 * @param {string} globPattern - The glob file pattern (see the npm module glob for pattern help).
 * @param {string} options - The options object.
 * @param {function} cb - The Callback handler which has no return values.
 */
const config = (globPattern, options, cb) => {
  warningExit();
  // Strict Means it will delete any .env files found with the same name of the ini file in the same folder
  let strict = false;

  // Detect Options (With Legacy Format Support)
  if (typeof options !== 'function') {
    if (options.strict) {
      strict = true;
    }
  } else {
    cb = options;
  }
  glob(globPattern, (err, files) => {
    if (err) {
      console.log('Entourage Config Error:', globPattern, options, err, files);
    }
    async.each(
      files,
      (file, callback) => {
        if (strict) {
          if (fs.existsSync(file.replace('.ent', '.env'))) {
            debug('Unlinking:', file.replace('.ent', '.env'));
            fs.unlinkSync(file.replace('.ent', '.env'));
          }
        }
        const decryptData = decrypt(null, fs.readFileSync(file, 'utf-8'));
        if (decryptData) {
          const envIni = ini.parse(decryptData);
          for (const inival in envIni) {
            if (!Object.prototype.hasOwnProperty.call(process.env, inival)) {
              process.env['' + inival + ''] = envIni[inival];
            }
          }
          callback();
        } else {
          callback();
        }
      },
      (err) => {
        if (err) {
          console.log('Entourage Config Error ::', err);
        }
        cb();
      }
    );
  });
};

module.exports = {
  config,
  generate,
  encrypt,
  decrypt
};
