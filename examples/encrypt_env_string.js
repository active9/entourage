var entourage = require('../index.js');

// Set This in your actual ENV (Do not hard code your keyEnt var like this example does)
var keyEnv = 'A very long random key here. you should probably generate one using random bits.';
process.env.ENTOURAGE_KEY = keyEnv;

// Data you want to encrypt
var rawData = 'This is the raw data you would encrypt. Generally this is ini file data.';

//  Call Entourage Config Loading by *.ent
var encrypted = entourage.encrypt(null, rawData);

console.log("Env data converted to Ent data", encrypted);