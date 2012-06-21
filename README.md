nodejs-directvps
================

Access the [DirectVPS](https://www.directvps.nl/) API from your Node.js code

# Installation

## From NPM

To install the module from the NPM repository run this:

```
npm install directvps
```

And then link inside your code with:

```js
var directvps = require('directvps')
```

## From source

Or install directly from Github source:

```
git clone https://github.com/fvdm/nodejs-directvps.git
```

And load in your code:

```js
var directvps = require('/path/to/nodejs-directvps/directvps.js')
```

# Setup

In order to use the API you need to have an API access private-key and certificate. Refer to the documentation for details. After loading the module with *require()* set the key and certificate with **setup()**.

## Variables

* **privateKey** - The private-key in plain text with BEGIN and END lines.
* **certificate** - The certificate in plain text with BEGIN and END lines.
* **privateKeyFile** - Path to the private-key file, no combined PEM file.
* **certificateFile** - Path to certificate file, no combined PEM file.

* **debug** - Set debug mode (boolean). This will emit the *debug* event on all API communication. Default is *false* to save memory.

## Load from files

This is the simple way, if you have access to a filesystem.

```js
directvps.setup({
	privateKeyFile:		'/path/to/private.key',
	certificateFile:	'/path/to/shared-certificate.crt'
})
```

## Load directly

Or you can load the private-key and certificate directly, ie. from a database.

```js
directvps.setup({
	privateKey:			'-----BEGIN RSA PRIVATE KEY-----',
	certificate:		'-----BEGIN CERTIFICATE-----'
})
```

# Usage

This module is event based, meaning all functions require a **callback** function parameter to process the result. All methods from the API are implemented directly, but for VPS specific methods a shorthand is also available. The two samples below highlight both methods. 

**The samples below is based on the NPM install. If you rather directly use the source file use the *require()* replacement above.**

## Direct method

In this example the API method *get_vpslist* is called, the *callback function* loops through the resulting *servers* object and for each server it writes a log to the console.

```js
var directvps = require('directvps')

directvps.get_vpslist( function( servers ) {
	for( var s in servers ) {
		var vps = servers[s]
		console.log( 'VPS '+ vps.vpsid +' allows '+ vps.traffic 'GB traffic' )
	}
})
```

## Shorthand method

In this example the **vps** shorthand method is called to get the functions for server *123*. Then its sub-function **.details** is called to get the server's information. In the background the script requests all servers with **get_vpslist**, loops through them until *vpsid* *123* is found and then send the result to the **callback** *function*. In this case, write a line to the console.

```js
var directvps = require('directvps')

directvps.vps(123).details( function( vps ) {
	console.log( 'VPS '+ vps.vpsid +' allows '+ vps.traffic 'GB traffic' )
})
```

# Events

Normal requested results are directly send to the associated *callback* function, but some others have their own event hooks:

## debug

There is a debug mode built in which allows you to monitor all API communication in detail. It returns *talk()* input parameters, request options and API response details.

**WARNING:** the *request* element contains your *private-key* and *certificate*. Make sure the debug details do not end up in the wrong hands.
**To save memory debug-mode is inactive by default, therefore you must set _debug_ to _true_ in the settings to activate this event:**
* **in setup:** directvps.setup({ debug: true })
* **manually:** directvps.settings.debug = true

```js
directvps.on( 'debug', console.log )
```

```js
{ input: 
   { type: 'POST',
     path: 'edit_reverse',
     fields: 
      { vpsid: 123,
        ipv4: '178.21.12.34',
        reverse: 'example.tld' } },
  request: 
   { host: 'api.directvps.nl',
     port: 443,
     path: '/1/edit_reverse',
     method: 'POST',
     headers: 
      { Accept: 'application/json',
        'User-Agent': 'directvps.js (https://github.com/fvdm/nodejs-directvps)',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': 116 },
     key: '-----BEGIN RSA PRIVATE KEY-----',
     cert: '-----BEGIN CERTIFICATE-----',
     agent: false,
     createConnection: [Function: createConnection],
     defaultPort: 443,
     setHost: true },
  response: 
   { length: 209,
     statusCode: 200,
     httpVersion: '1.1',
     headers: 
      { date: 'Fri, 15 Jun 2012 12:11:09 GMT',
        server: 'Apache/2.2.16 (Debian)',
        'x-plp-version': '3.23',
        connection: 'close',
        'transfer-encoding': 'chunked',
        'content-type': 'application/json' },
     body: '[..]' } }
```

## License

This code is **COPYLEFT** meaning you can do anything you like except copyrighting it. When possible it would be nice to include the source URL with the code for future reference: https://github.com/fvdm/nodejs-directvps
