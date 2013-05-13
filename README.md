nodejs-directvps
================

Access the [DirectVPS](https://www.directvps.nl/) API from your Node.js code


Installation
------------


### From NPM

To install the module from the NPM repository run this:

	npm install directvps
	

And then link inside your code with:

```js
var directvps = require('directvps')
```


### From source

Or install directly from Github source:

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


API methods
-----------

### get_accountdata ( callback )

Get details about the current account.

```js
directvps.get_accountdata( console.log )
```

```js
[ { landnummer: '31',
    kid: '123456789',
    woonplaats: 'Smalltown',
    adres: 'Some Street 123',
    firma: 'Company Inc.',
    email: 'your@mail.tld',
    klantnummer: 'DB000',
    bankrekening: '123456789',
    mobiel: '123456789',
    smsbeforeaction: '1',
    naam: 'John Smith',
    postcode: '1000 AA',
    allowconsole: '0' } ]
```


### edit_accountdata ( object, callback )

Edit your account details.

```js
directvps.edit_accountdata(
	{
		kid:          '123456789',
		allowconsole: 1
	},
	console.log
)
```


### get_productlist ( callback )

Get a list of all available products.

```js
directvps.get_productlist( console.log )
```

```js
{ '1': 
   { traffic: 250,
     hdd: 25,
     platformid: '1',
     mem: 256,
     omschrijving: 'DirectVPS Basic 1',
     productid: '1' },
  '2': 
   { traffic: 500,
     hdd: 50,
     platformid: '1',
     mem: 512,
     omschrijving: 'DirectVPS Basic 2',
     productid: '2' }
```

_(output truncated)_


### get_isolist ( callback )

Get a list of all available ISOs (OS images).

```js
directvps.get_isolist( console.log )
```

```js
{ '0': { isoid: '0', omschrijving: '- leeg -' },
  '1': { isoid: '1', omschrijving: 'Debian GNU/Linux 6.0 / Squeeze 64b' },
  '2': { isoid: '2', omschrijving: 'CentOS 6.3 64b' },
  '3': { isoid: '3', omschrijving: 'KVM Virtio drivers voor Windows' },
  '4': { isoid: '4', omschrijving: 'Clear OS 5.2 64b' },
  '5': { isoid: '5', omschrijving: 'Windows Password Reset' },
  '6': { isoid: '6', omschrijving: 'Ubuntu 10.04 64b' },
  '7': { isoid: '7', omschrijving: 'Microsoft Windows Server 2008R2 NL' }
```

_(output truncated)_


### get_bootorderlist ( callback )

Get available boot orders for servers.

```js
directvps.get_bootorderlist( console.log )
```

```js
{ '0': { omschrijving: 'HDD, DVD, Network', bootorderid: '0' },
  '2': { omschrijving: 'DVD, HDD, Network', bootorderid: '2' },
  '3': { omschrijving: 'Network, HDD, DVD', bootorderid: '3' } }
```

_(output truncated)_


### get_imagelist ( callback )

Get available OS images.

```js
directvps.get_imagelist( console.log )
```

```js
{ '2': 
   { versienaam: 'Lenny',
     distributie: 'Debian',
     dadistro: '1',
     bits: '32',
     omschrijving: 'Debian 5.0 / Lenny | 32b',
     versie: '5.0',
     imageid: '2',
     afgeraden: '1',
     laatste_versie: '0' },
  '4': 
   { versienaam: 'Jaunty',
     distributie: 'Ubuntu',
     dadistro: '0',
     bits: '32',
     omschrijving: 'Ubuntu 9.04 / Jaunty | 32b',
     versie: '9.04',
     imageid: '4',
     afgeraden: '0',
     laatste_versie: '0' } }
```

_(output truncated)_


### get_kernellist ( callback )

Get available kernels.

```js
directvps.get_kernellist( console.log )
```

```js
{ '0': 
   { kernelid: '0',
     default: '0',
     bits: '64',
     omschrijving: 'Eigen kernel',
     versie: 'Eigen kernel',
     afgeraden: '0' },
  '1': 
   { kernelid: '1',
     default: '0',
     bits: '32',
     omschrijving: '< 2.6.36',
     versie: '2.6.26',
     afgeraden: '1' } }
```

_(output truncated)_


### get_locationlist ( callback )

Get physical locations where servers can be created.

```js
directvps.get_locationlist( console.log )
```

```js
{ '1': 
   { land: 'NL',
     locationid: '1',
     omschrijving: 'NL, Amsterdam (Schuberg Philis)',
     naam: 'Schuberg Philis',
     plaats: 'Amsterdam' },
  '2': 
   { land: 'NL',
     locationid: '2',
     omschrijving: 'NL, Amsterdam (Nikhef)',
     naam: 'Nikhef',
     plaats: 'Amsterdam' } }
```

_(output truncated)_


### get_actionlist ( callback )

List actions certain methods may return.

```js
directvps.get_actionlist( console.log )
```

```js
{ '1': { actionid: '1', omschrijving: 'Start' },
  '2': { actionid: '2', omschrijving: 'Shutdown' },
  '3': { actionid: '3', omschrijving: 'Reboot' },
  '6': { actionid: '6', omschrijving: 'Herinstallatie' },
  '8': { actionid: '8', omschrijving: 'Herstel vanuit backup' } }
```

_(output truncated)_


### get_statuslist ( callback )

List statuses certain methods may return.

```js
directvps.get_statuslist( console.log )
```

```js
{ '1': { statusid: '1', omschrijving: 'Aan te maken' },
  '2': { statusid: '2', omschrijving: 'In aanmaak' },
  '3': { statusid: '3', omschrijving: 'Actief' },
  '4': { statusid: '4', omschrijving: 'Backup wordt gemaakt' } }
```

_(output truncated)_
VPS
---


### vps.action ( actionID, [sub], [when], callback )


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


Possibilities:

```js
// reboot asap
directvps.vps( 123 ).action( 3, console.log )

// upgrade to kernel #10 (3.2.2, 64b)
directvps.vps( 123 ).action( 12, 10, console.log )

// graceful shutdown on new-year, better use actionID 2
directvps.vps( 123 ).action( 'shutdown', '01-01-2013 0:00', console.log )
```


### vps.actionStatus ( planningID, callback )

Get the status of the planned action.


    Name         Type       Required   Description                            Example
    ----------   --------   --------   ------------------------------------   -----------
    planningID   numeric    required   planning_id from 'vps.action'.         8765
    callback     function   required   Receives object with status details.   console.log


```js
directvps.vps( 123 ).actionStatus( 8765, console.log )
```

```js
{ status: '2',
  error: '0',
  errormessage: '',
  label: 'complete' }
```


### vps.start ( callback )

Start a server (after installation or shutdown).


    Name       Type       Required   Description                  Example
    --------   --------   --------   --------------------------   -----------
    callback   function   required   Object with action result.   console.log


```js
directvps.vps( 123 ).start( console.log )
```


### vps.shutdown ( [force], callback )

Shutdown a server.


    Param      Type       Required   Description                          Example
    --------   --------   --------   ----------------------------------   -----------
    force      boolean    optional   True:  force shutdown                true
                                    False: graceful shutdown (default)
    callback   function   required   object with action result            console.log


```js
directvps.vps( 123 ).shutdown( true, console.log )
```


### vps.reboot ( [force], callback )

Reboot a server.


    Param      Type       Required   Description                        Example
    --------   --------   --------   --------------------------------   -----------
    force      boolean    optional   True:  force reboot                true
                                    False: graceful reboot (default)
    callback   function   required   object with action result          console.log


```js
directvps.vps( 123 ).reboot( true, console.log )
```


### vps.backups ( callback )

Get a list of all backups for this server.


    Name       Type       Required   Description                 Example
    --------   --------   --------   -------------------------   -----------
    callback   function   required   Object with action result   console.log


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


### vps.restore ( backupID, callback )

Restore a backup.


    Name       Type       Required   Description                 Example
    --------   --------   --------   -------------------------   -----------
    backupID   numeric    required   ID of backup to restore     1234567
    callback   function   required   Object with action result   console.log


```js
directvps.vps( 123 ).restore( 1234567, console.log )
```

```js
{ planningid: '8765',
  error: '0',
  errormessage: '' }
```


### vps.update ( params, callback )

Change server settings. Set only the params you wish to edit.


    Name       Type       Required   Description                 Example
    --------   --------   --------   -------------------------   -------------
    params     object     required   New server settings         {tag: 'test'}
    callback   function   required   Object with action result   console.log


#### Parameters


    Param      Type     Description
    --------   ------   -----------------------------------------------------
    tag        string   Label, vissible in vps.details and the Control Panel.
    password   string   Set default root password for next reinstall.
    sshkey     string   Set default SSH public-key for next reinstall.
    hostname   string   Set default hostname for next reinstall.


#### Example

```js
directvps.vps( 123 ).update(
	{
		tag:      'test',
		hostname: 'my.server.tld'
	},
	console.log
)
```


### vps.upgradeProduct ( productID, callback )

Upgrade the server to another product.


    Name       Type       Required   Description                 Example
    ---------   --------   --------   -------------------------   -----------
    productID   numeric    required   ID of new product           20
    callback    function   required   Object with action result   console.log


```js
directvps.vps( 123 ).upgradeProduct( 20, console.log )
```


### vps.upgradeKernel ( kernelID, callback )

Change to another kernel. This will reboot the server, but all contents and OS should remain.


    Name       Type       Required   Description                 Example
    --------   --------   --------   -------------------------   -----------
    kernelID   numeric    required   ID of new kernel            10
    callback   function   required   Object with action result   console.log


```js
directvps.vps( 123 ).upgradeKernel( 10, console.log )
```


### vps.reinstall ( imageID, callback )

Perform a clean install of the choosen OS image.


    Name       Type       Required   Description                 Example
    --------   --------   --------   -------------------------   -----------
    imageID    numeric    required   ID of new OS image          28
    callback   function   required   Object with action result   console.log


```js
directvps.vps( 123 ).reinstall( 28, console.log )
```


### vps.installDirectadmin ( licenseID, callback )

Install DirectAdmin on the server.


    Name        Type       Required   Description                 Example
    ---------   --------   --------   -------------------------   -----------
    licenseID   numeric    required   DirectAdmin license ID      111222
    callback    function   required   Object with action result   console.log


```js
directvps.vps( 123 ).installDirectadmin( 111222, console.log )
```


### vps.addDirectadmin ( licenseID, callback )

Add (buy) a DirectAdmin license for this server. This will *not* install DA on the server, use [vps.installDirectadmin](#vpsinstalldirectadmin) to perform the installation.


    Name       Type       Required   Description                  Example
    ---------   --------   --------   -------------------------   -----------
    callback    function   required   Object with action result   console.log


```js
directvps.vps( 123 ).addDirectadmin( 111222, console.log )
```


### vps.deleteDirectadmin ( licenseID, callback )

Delete a DirectAdmin license from this server.


    Name        Type       Required   Description                 Example
    ---------   --------   --------   -------------------------   -----------
    licenseID   numeric    required   DirectAdmin license ID      111222
    callback    function   required   Object with action result   console.log


```js
directvps.vps( 123 ).deleteDirectadmin( 111222, console.log )
```


### vps.addIPv4 ( callback )

Add (buy) an IPv4 address to this server.


    Name       Type       Required   Description                  Example
    --------   --------   --------   --------------------------   -----------
    callback   function   required   Object with action result    console.log


```js
directvps.vps( 123 ).addIPv4( console.log )
```


### vps.ipv4 ( [ip], callback )

Get details about one IP or all associated to this server.


    Name       Type       Required   Description                         Example
    --------   --------   --------   ---------------------------------   -----------
    ip         string     optional   Include: get details about one IP   1.2.3.4
                                    Exclude: get all IPs
    callback   function   required   Object with action result           console.log


#### Details about one IP

```js
directvps.vps( 123 ).ipv4( '1.2.3.4', console.log )
```

#### Details about all associated IPs

```js
directvps.vps( 123 ).ipv4( console.log )
```


### vps.ipv4.delete ( callback )

Remove an IPv4 address from this server.


    Name       Type       Required   Description          Example
    --------   --------   --------   ------------------   -----------
    callback   function   required   Object with result   console.log


```js
directvps.vps( 123 ).ipv4( '1.2.3.4' ).delete( console.log )
```


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