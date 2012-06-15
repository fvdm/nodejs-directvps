nodejs-directvps
================

Access the [DirectVPS](https://www.directvps.nl/) API from your Node.js code

## Installation

### From NPM

To install the module from the NPM repository run this:

```
npm install directvps
```

And then link inside your code with:

```js
var directvps = require('directvps')
```

### From source

Or install directly from Github source:

```
git clone https://github.com/fvdm/nodejs-directvps.git
```

And load in your code:

```js
var directvps = require('/path/to/nodejs-directvps/directvps.js')
```

## Setup

In order to use the API you need to have an API access private-key and certificate. Refer to the documentation for details. After loading the module with *require()* set the key and certificate with **setup()**.

### Variables

* **privateKey** - The private-key in plain text with BEGIN and END lines.
* **certificate** - The certificate in plain text with BEGIN and END lines.
* **privateKeyFile** - Path to the private-key file, no combined PEM file.
* **certificateFile** - Path to certificate file, no combined PEM file.

### Load from files

This is the simple way, if you have access to a filesystem.

```js
directvps.setup({
	privateKeyFile:		'/path/to/private.key',
	certificateFile:	'/path/to/shared-certificate.crt'
})
```

### Load directly

Or you can load the private-key and certificate directly, ie. from a database.

```js
directvps.setup({
	privateKey:			'-----BEGIN RSA PRIVATE KEY-----',
	certificate:		'-----BEGIN CERTIFICATE-----'
})
```

## Usage

This module is event based, meaning all functions require a **callback** parameter in order to process the result. All methods from the API are implemented directly, but for VPS specific methods a shorthand is also available. The two samples below highlight both methods. 

**The sample below is based on the NPM install. If you rather directly use the source file use the *require()* replacement above.**

### Direct method

```js
var directvps = require('directvps')

directvps.get_vpslist( function( servers ) {
	for( var s in servers ) {
		var vps = servers[s]
		console.log( 'VPS '+ vps.vpsid +' allows '+ vps.traffic 'GB traffic' )
	}
})
```

### Shorthand method

```js
var directvps = require('directvps')

directvps.vps(123).details( function( vps ) {
	console.log( 'VPS '+ vps.vpsid +' allows '+ vps.traffic 'GB traffic' )
})
```

## License

This code is **COPYLEFT** meaning you can do anything you like except copyrighting it. When possible it would be nice to include the source URL with the code for future reference: https://github.com/fvdm/nodejs-directvps
