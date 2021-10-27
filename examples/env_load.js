const entourage = require('../index.js');

// Set This in your actual ENV (Do not hard code your keyEnt var like this example does)
const keyEnt = 'A very long random key here. you should probably generate one using random bits.';
process.env.ENTOURAGE_KEY = keyEnt;

//  Call Entourage Config Loading by *.ent
entourage.config('**/*.ent', () => {
  // Done Loading .ENT
  console.log('ENV Test', process.env.TEST_ENV);
});
