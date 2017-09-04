var entourage = require('../index.js');

// Set This in your actual ENV (Do not hard code your keyEnt var like this example does)
var keyEnt = 'A very long random key here. you should probably generate one using random bits.';
process.env.ENTOURAGE_KEY = keyEnt;

// Only Once Generate All .env files to .ent (encrypted env)
entourage.generate('**/*.env', '.ent', function() {
	
	// Done Generating .ENT
	console.log('Encrypted ENV (ENT) Generated');
});