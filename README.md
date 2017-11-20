# Entourage
A Secure production ready entourage for ENV variables

# Installing Entourage

Using npm

```bash
npm install --save entourage
```

# Setup

Entourage is a secure Environment Variable loader for production use. Before we begin there are a few things to take note of:

First, Never Ever Ever Never commit your .env or .ent files to your repo or any other version control system. Utilize .gitignore to exclude *.env or *.ent files. These files should be hand delivered during development or devops delivered during deployment in production. You should not use different .ent files according to NODE_ENV. Only setup your .ent files for a single environment (production, development, test, debug, ect).

Second, Entourage requires you to set an Environment Variable named ENTOURAGE_KEY. The value of this variable will be at least 16 digits and should be the most random set of characters you can generate.

An easy way to generate a random string of digits for your Entourage Key on linux is:
```bash
echo "$(< /dev/urandom tr -dc A-Za-z0-9 | head -c 32)"
```

Once you have your 16+ digit key you can set it as follows:

On Windows:
```bash
set ENTOURAGE_KEY=[your key here without brackets]
```

On Linux / Mac:
```bash
export ENTOURAGE_KEY=[your key here without brackets]
```

# Usage

There are two parts, the Generator and the Config. The Generator helps you easily convert .env files to .ent files. .env fils are ini files without headers (comments are still allowed if the line starts with a semicolon ;)

To get started make yourself an .env file if you have no already. Inside put the contents:

```bash
TEST_ENV=true
```

Next create a deploy.js script and inside put the following:
```bash
var entourage = require('entourage');
entourage.generate('**/*.env', '.ent', function() {
	
	// Done Generating .ENT
	console.log('Encrypted ENV (ENT) Generated');
});
```

This will use glob patterns to find all .env files within the current and sub directories. If a .env file is found it will generate an encrypted .ent file in the same location.

Using your encrypted environment file .ent is just as easy. Note: any env var loaded by Entourage will not override set environment variables on the system. This is done to protect the integrity of a systems environment variables by only appending newly found .ent vars.

```bash
//  Call Entourage Config Loading by *.ent
entourage.config('**/*.ent', function() {
		
	// Done Loading .ENT
	console.log('ENV Test', process.env.TEST_ENV);
});
```

The output will be:

```bash
ENV Test true
```

Strict Mode allows you to run the same call as above but with an optional options object with a strict object boolean. Strict being enabled will remove any .env files that match the glob .ent pattern. For example:


```bash
//  Call Entourage Config Loading by *.ent
entourage.config('**/*.ent', {
	strict: true
},function() {
		
	// Done Loading .ENT
	console.log('ENV Test', process.env.TEST_ENV);
});
```

Any .env files found matching the glob pattern will be found and removed with strict enabled.


```bash
The system deletes all found **/*.env files
```

The output will be:

```bash
ENV Test true
```

# Options

Strict: boolean
This option will remove any found .env files good for use in production environments where you want to ensure no .env files exist on the server running this module.

# Conclusion

Providing you create a secure enough key for Entourage to use and the user of your system is never exploited by a hacker to read your ENTOURAGE_KEY then, this should be secure enough to use in production environments. This has been tested and is in use in a production environment however, there is no guarantee your environment variables will remain secure since the decryption key is stored as an environment variable on the system you wish to deploy to. Use at your own risk. But!!! it should be safe so long as you can lock down your user level console on your deployed operating system (block ssh from public, disable PAM , and use a vpn for key based access).
