nodejs-directvps
============================

Access the [DirectVPS](https://www.directvps.nl/) API from your Node.js code


Installation
============================


[![Build Status](https://secure.travis-ci.org/fvdm/nodejs-directvps.png?branch=master)](http://travis-ci.org/fvdm/nodejs-directvps)


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


Setup
============================


In order to use the API you need to have an API access private-key and certificate. Refer to the documentation for details. After loading the module with *require()* set the key and certificate with **setup()**.


## Variables

```
Name              Type      Description                          Example
---------------   -------   ----------------------------------   ---------
privateKey        string    The private-key in plain text,
certificate       string    The certificate in plain text.
privateKeyFile    string    Path to the private-key file,        ~/api.key
certificateFile   string    Path to certificate file,            ~/api.crt
debug             boolean   Set debug mode. This will emit the   true
                            debug event on all API calls.
                            Default is 'false' to save memory.
```


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

Usage
============================


This module is event based, meaning all functions require a **callback** function parameter to process the result. All methods from the API are implemented directly, but for VPS specific methods a shorthand is also available. The two samples below highlight both methods. 

All *boolean* parameters can also be strings: true/false, yes/no, 1/0.

**The exsamples below are based on the NPM install. If you rather directly use the source file use the *require()* replacement above.**


## Direct method

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


## Shorthand method

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


## Extended example


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


Events
============================


Normal requested results are directly send to the associated *callback* function, but some others have their own event hooks:


## fail
### ( error, request, fields )

API communication failed.

```
Param     Description
-------   ------------------
error     The error
request   Request parameters
fields    Data that was sent
```


```js
directvps.on( 'fail', console.log )
```


## fatal
### ( reason )

Something went wrong and the process is about to be destroyed.

```js
directvps.on( 'fatal', console.log )
```


## debug
### ( details )

There is a debug mode built in which allows you to monitor all API communication in detail. It returns *talk()* input parameters, request options and API response details.

**To save memory debug-mode is inactive by default, therefore you must set _debug_ to _true_ in the settings to activate this event:**
* **in setup:** directvps.setup({ debug: true })
* **manually:** directvps.settings.debug = true

**NOTE:** in the debug *request* element your **key** (private-key) and **cert** (certificate) are replaced with their sha1 hashes for security. This way you can compare them with the ones you intended to use without them ending up in the wrong hands.

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
     key: 'f1d2d2f924e986ac86fdf7b36c94bcdf32beec15',
     cert: 'e242ed3bffccdf271b7fbaf34ed72d089537b42f',
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


VPS
============================


## vps.action
### ( actionID, [sub], [when], callback )

```
Name       Type       Required   Description                              Example
--------   --------   --------   --------------------------------------   ---------------
actionID   string     required   ID or name of the action to run, best    12
                                 is to provide an ID. Providing a name
                                 would first request get_actionlist,
                                 loop through the list lowercase
                                 matching each description and finally
                                 run the action.
sub        string     optional   A value for some actions, 'product_id'   10
when       string     optional   Schedule at date & time.                 2012-09-15 4:06
callback   function   required   Receives result object.                  console.log
```

Possibilities:

```js
// reboot asap
directvps.vps( 123 ).action( 3, console.log )

// upgrade to kernel #10 (3.2.2, 64b)
directvps.vps( 123 ).action( 12, 10, console.log )

// graceful shutdown on new-year, better use actionID 2
directvps.vps( 123 ).action( 'shutdown', '01-01-2013 0:00', console.log )
```

## vps.actionStatus
### ( planningID, callback )

Get the status of the planned action.

```
Name         Type       Required   Description                            Example
----------   --------   --------   ------------------------------------   -----------
planningID   numeric    required   planning_id from 'vps.action'.         8765
callback     function   required   Receives object with status details.   console.log
```

```js
directvps.vps( 123 ).actionStatus( 8765, console.log )
```

```js
{ status: '2',
  error: '0',
  errormessage: '',
  label: 'complete' }
```


## vps.start
### ( callback )

Start a server (after installation or shutdown).

```
Name       Type       Required   Description                  Example
--------   --------   --------   --------------------------   -----------
callback   function   required   Object with action result.   console.log
```

```js
directvps.vps( 123 ).start( console.log )
```


## vps.shutdown
### ( [force], callback )

Shutdown a server.

```
Param      Type       Required   Description                          Example
--------   --------   --------   ----------------------------------   -----------
force      boolean    optional   True:  force shutdown                true
                                 False: graceful shutdown (default)
callback   function   required   object with action result            console.log
```

```js
directvps.vps( 123 ).shutdown( true, console.log )
```


## vps.reboot
### ( [force], callback )

Reboot a server.

```
Param      Type       Required   Description                        Example
--------   --------   --------   --------------------------------   -----------
force      boolean    optional   True:  force reboot                true
                                 False: graceful reboot (default)
callback   function   required   object with action result          console.log
```

```js
directvps.vps( 123 ).reboot( true, console.log )
```

## vps.backups
### ( callback )

Get a list of all backups for this server.

```
Name       Type       Required   Description                 Example
--------   --------   --------   -------------------------   -----------
callback   function   required   Object with action result   console.log
```

```js
directvps.vps( 123 ).backups( console.log )
```

```js
{ '2345': 
   { einde: '2012-05-14 00:22:39',
     backupid: '2345',
     level: '0',
     status: '1',
     begin: '2012-05-14 00:14:59',
     size: '478756160' },
  '1234': 
   { einde: '2012-06-13 02:33:40',
     backupid: '1234',
     level: '1',
     status: '1',
     begin: '2012-06-13 02:32:21',
     size: '1885186' } }
```


## vps.restore
### ( backupID, callback )

Restore a backup.

```
Name       Type       Required   Description                 Example
--------   --------   --------   -------------------------   -----------
backupID   numeric    required   ID of backup to restore     1234567
callback   function   required   Object with action result   console.log
```

```js
directvps.vps( 123 ).restore( 1234567, console.log )
```

```js
{ planningid: '8765',
  error: '0',
  errormessage: '' }
```


## vps.upgradeProduct
### ( productID, callback )

Upgrade the server to another product.

```
Name       Type       Required   Description                 Example
---------   --------   --------   -------------------------   -----------
productID   numeric    required   ID of new product           20
callback    function   required   Object with action result   console.log
```

```js
directvps.vps( 123 ).upgradeProduct( 20, console.log )
```


## vps.upgradeKernel
### ( kernelID, callback )

Change to another kernel. This will reboot the server, but all contents and OS should remain.

```
Name       Type       Required   Description                 Example
--------   --------   --------   -------------------------   -----------
kernelID   numeric    required   ID of new kernel            10
callback   function   required   Object with action result   console.log
```

```js
directvps.vps( 123 ).upgradeKernel( 10, console.log )
```


## vps.reinstall
### ( imageID, callback )

Perform a clean install of the choosen OS image.

```
Name       Type       Required   Description                 Example
--------   --------   --------   -------------------------   -----------
imageID    numeric    required   ID of new OS image          28
callback   function   required   Object with action result   console.log
```

```js
directvps.vps( 123 ).reinstall( 28, console.log )
```


## vps.ipv4
### ( [ip], callback )

Get details about one IP or all associated to this server.

```
Name       Type       Required   Description                         Example
--------   --------   --------   ---------------------------------   -----------
ip         string     optional   Include: get details about one IP   1.2.3.4
                                 Exclude: get all IPs
callback   function   required   Object with action result           console.log
```


Unlicense
============================


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