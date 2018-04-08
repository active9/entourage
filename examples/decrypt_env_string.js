var entourage = require('../index.js');

// Set This in your actual ENV (Do not hard code your keyEnt var like this example does)
var keyEnv = 'A very long random key here. you should probably generate one using random bits.';
process.env.ENTOURAGE_KEY = keyEnv;

// Encrypted Raw Data
var encryptedData = 'ef39e79d24eced6809d99bc8f65ce598QtYchr35kP6PabfWFVjfgQsUyW6qLVOdMCoVGNgT13/SenGdV2d904KVkOUk28M2G9DfVVPy0nMFicCLMfxpWeLzq6QuFZ0K3pP9T1J4Zoo=';

//  Call Entourage Config Loading by *.ent
var decrypted = entourage.decrypt(null, encryptedData);

console.log("Envt data converted to Env data", decrypted);