nodejs-directvps
================

Access the [DirectVPS](https://www.directvps.nl/) API from your Node.js code


Table of contents
-----------------

- [Installation](#installation)
- [Setup & settings](#setup)
- [Usage](#usage)
- [Methods](#methods)
- [Unlicense](#unlicense)


Installation
------------


### From npm

To install the module from the [npm repository](https://npmjs.org/package/directvps) run this:

	npm install directvps
	

And then link inside your code with:

```js
var directvps = require('directvps')
```


### From source

Install directly from Github source:

	git clone https://github.com/fvdm/nodejs-directvps.git


And load in your code:

```js
var directvps = require('/path/to/nodejs-directvps')
```


Setup
-----

In order to use the API you need to have an API access private-key and certificate. Refer to the documentation for details. After loading the module with *require()* set the key and certificate with **setup()**.


### Settings


    Name              Type      Description                          Example
    ---------------   -------   ----------------------------------   ---------
    privateKey        string    The private-key in plain text.
    certificate       string    The certificate in plain text.
    privateKeyFile    string    Path to the private-key file.        ~/api.key
    certificateFile   string    Path to certificate file.            ~/api.crt
    verifyCert        boolean   Validate server certificate          true
                                agains trusted CA's.
    debugResponse     function  Receive communication details.


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

Usage
-----


This module is event based, meaning all functions require a **callback** function parameter to process the result. All methods from the API are implemented directly, but for VPS specific methods a shorthand is also available. The two samples below highlight both methods. 

**The examples below are based on the NPM install. If you rather directly use the source file use the *require()* replacement above.**


### Direct method

In this example the API method *[get_vpslist](#getvpslist)* is called, the *callback function* loops through the resulting *servers* object and for each server it writes a log to the console.

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

In this example the **[vps](#vps)** shorthand method is called to get the functions for server *123*. Then its sub-function **[.details](#vpsdetails)** is called to get the server's information. In the background the script requests all servers with **[get_vpslist](#getvpslist)**, loops through them until *vpsid* *123* is found and then send the result to the **callback** *function*. In this case, to write a line to the console.

```js
var directvps = require('directvps')

// one line
directvps.vps(123).details( function( details ) {
	console.log( 'VPS '+ vps.vpsid +' allows '+ vps.traffic 'GB traffic' )
})

// or via a variable
var vps = directvps.vps(123)
vps.details( function( details ) {
	console.log( 'VPS '+ vps.vpsid +' allows '+ vps.traffic 'GB traffic' )
})
```


### Extended example


Shutdown all servers from one client, these may be identified with 'client: 123' in their tag.

```js
// First get the list of all servers
directvps.get_vpslist( function( servers ) {
	
	// walk through each of them
	for( var vpsid in servers ) {
		
		// request server specific functions
		var vps = directvps.vps( vpsid )
		
		// and its information
		vps.details = servers[ vpsid ]
		
		// do the matching
		if( vps.details.tag.match( /^client: 123\, / ) ) {
			
			// found one, shutdown gracefully
			vps.shutdown( function( plan ) {
				
				// report status to console
				var status = 'Server '+ vpsid +' shutdown '
				
				if( plan.error == '0' ) {
					status += 'planned: ID '+ plan.planningid
				} else {
					status += 'failed: '+ plan.errormessage
				}
				
				console.log( status )
				
			})
			
		}
		
	}
	
})
```


Methods
-------

The methods are described in the wiki at Github:

<https://github.com/fvdm/nodejs-directvps/wiki>


Unlicense
---------

This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <http://unlicense.org>
