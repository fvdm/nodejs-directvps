/*
Unofficial DirectVPS module for node.js

Source:       https://github.com/fvdm/nodejs-directvps
Feedback:     https://github.com/fvdm/nodejs-directvps/issues
License:      Unlicense / Public Domain

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
*/

var fs = require('fs'),
    https = require('https'),
    EventEmitter = require('events').EventEmitter,
    querystring = require('querystring')

// INIT
var directvps = new EventEmitter()

directvps.settings = {
	apiVersion:	1,
	debug:		false,
	verifyCert:	false
}

// Setup
directvps.setup = function( vars ) {
	
	// private key
	if( vars.privateKeyFile ) {
		directvps.settings.privateKey = fs.readFileSync( vars.privateKeyFile, 'utf8' )
	}
	else if( vars.privateKey ) {
		directvps.settings.privateKey = vars.privateKey
	}
	
	// certificate
	if( vars.certificateFile ) {
		directvps.settings.certificate = fs.readFileSync( vars.certificateFile, 'utf8' )
	}
	else if( vars.certificate ) {
		directvps.settings.certificate = vars.certificate
	}
	
	// set debug mode
	directvps.settings.debug = vars.debug === true ? true : false
	
	// certificate verification
	directvps.settings.verifyCert = vars.verifyCert === true : true : false
	
}

//////////////////////
// Direct API calls //
//////////////////////

// Get products
directvps.get_productlist = function( callback ) {
	directvps.talk( 'GET', 'get_productlist', {}, function( res ) {
		var products = {}
		for( var p in res ) {
			var product = res[p]
			products[ product.productid ] = product
		}
		callback( products )
	})
}

// Get images
directvps.get_imagelist = function( callback ) {
	directvps.talk( 'GET', 'get_imagelist', {}, function( res ) {
		var images = {},
		    versions = {}
		
		// build images & collect latest versions
		for( var i in res ) {
			var image = res[i]
			
			image.versie_check = parseInt( image.versie.replace('.', '') )
			if( !versions[ image.distributie ] || image.versie_check > versions[ image.distributie ] ) {
				versions[ image.distributie ] = image.versie_check
			}
			
			images[ image.imageid ] = image
		}
		
		// set latest versions
		for( var i in images ) {
			images[i].laatste_versie = images[i].versie_check == versions[ images[i].distributie ] ? '1' : '0'
			delete images[i].versie_check
		}
		
		callback( images )
	})
}

// Get kernels
directvps.get_kernellist = function( callback ) {
	directvps.talk( 'GET', 'get_kernellist', {}, function( res ) {
		var kernels = {}
		for( var k in res ) {
			var kernel = res[k]
			kernels[ kernel.kernelid ] = kernel
		}
		callback( kernels )
	})
}

// Get locations
directvps.get_locationlist = function( callback ) {
	directvps.talk( 'GET', 'get_locationlist', {}, function( res ) {
		var locations = {}
		for( var l in res ) {
			var location = res[l]
			locations[ location.locationid ] = location
		}
		callback( locations )
	})
}

// Get actions
directvps.get_actionlist = function( callback ) {
	directvps.talk( 'GET', 'get_actionlist', {}, function( res ) {
		var actions = {}
		for( var a in res ) {
			var action = res[a]
			actions[ action.actionid ] = action
		}
		callback( actions )
	})
}

// Get statuses
directvps.get_statuslist = function( callback ) {
	directvps.talk( 'GET', 'get_statuslist', {}, function( res ) {
		var statuses = {}
		for( var s in res ) {
			statuses[ res[s].statusid ] = res[s]
		}
		callback( statuses )
	})
}

// Get VPS list
directvps.get_vpslist = function( callback ) {
	directvps.talk( 'GET', 'get_vpslist', {}, function( res ) {
		var servers = {}
		for( var s in res ) {
			var server = res[s]
			servers[ server.vpsid ] = server
		}
		
		if( typeof callback == 'function' ) {
			callback( servers )
		}
	})
}

// Get backups
directvps.get_backuplist = function( vpsid, callback ) {
	directvps.talk( 'POST', 'get_backuplist', { vpsid: vpsid }, function( res ) {
		var backups = {}
		for( var b in res[0].backup ) {
			backups[ res[0].backup[b].backupid ] = res[0].backup[b]
		}
		callback( backups )
	})
}

// Update VPS
directvps.edit_vps = function( set, callback ) {
	directvps.talk( 'POST', 'edit_vps', set, callback )
}

// Plan action
directvps.add_action = function( set, callback ) {
	directvps.talk( 'POST', 'add_action', set, callback )
}

// Action status
directvps.get_actionstatus = function( set, callback ) {
	directvps.talk( 'POST', 'get_actionstatus', set, callback )
}

// Get IPv4 address
directvps.get_ipv4 = function( vpsid, callback ) {
	directvps.talk( 'POST', 'get_ipv4', { vpsid: vpsid }, function( res ) {
		var ips = {}
		for( var i in res[0].ip ) {
			var ip = res[0].ip[i]
			ips[ ip[0] ] = {
				ip:		res[0].ip[i][0],
				type:		res[0].ip[i][1],
				typeLabel:	res[0].ip[i][1] == '1' ? 'primary' : 'secondary'
			}
		}
		callback( ips )
	})
}

// Add (buy) IPv4 address
directvps.add_ipv4 = function( vpsid, callback ) {
	directvps.talk( 'POST', 'add_ipv4', { vpsid: vpsid }, callback )
}

// Delete IPv4 address
directvps.del_ipv4 = function( vpsid, ipv4, callback ) {
	directvps.talk( 'POST', 'del_ipv4', { vpsid: vpsid, ipv4: ipv4 }, callback )
}

// Add DirectAdmin license
directvps.add_da = function( vpsid, callback ) {
	directvps.talk( 'POST', 'add_da', { vpsid: vpsid }, callback )
}

// Delete DirectAdmin license
directvps.del_da = function( vpsid, licenseid, callback ) {
	directvps.talk( 'POST', 'del_da', { vpsid: vpsid, lid: licenseid }, callback )
}

// Get IP reverse address
directvps.get_reverse = function( vpsid, ipv4, callback ) {
	directvps.talk( 'POST', 'get_reverse', { vpsid: vpsid, ipv4: ipv4 }, callback )
}

// Edit IP reverse address
directvps.edit_reverse = function( vpsid, ipv4, reverse, callback ) {
	directvps.talk( 'POST', 'edit_reverse', { vpsid: vpsid, ipv4: ipv4, reverse: reverse }, callback )
}

// Create VPS
directvps.add_vps = function( set, callback ) {
	directvps.talk( 'POST', 'add_vps', set, callback )
}

// Traffic
directvps.get_traffic = function( vpsid, callback ) {
	directvps.talk( 'POST', 'get_traffic', { vpsid: vpsid }, function( res ) {
		var result = {}
		if( res[0].error == '0' && res[0].traffic[0].jaar !== undefined ) {
			for( var ti in res[0].traffic ) {
				var t = res[0].traffic[ti]
				if( result[ t.jaar ] === undefined ) {
					result[ t.jaar ] = {}
				}
				result[ t.jaar ][ t.maand ] = t
			}
		}
		
		callback( result )
	})
}


///////////////
// Shorthand //
///////////////

// VPS stuff
directvps.vps = function( vpsid ) {
	
	return {
		
		// info
		details: function( cb ) {
			directvps.get_vpslist( function( list ) {
				cb( list[ vpsid ] )
			})
		},
		
		// data traffic
		traffic: function( cb ) {
			directvps.get_traffic( vpsid, cb )
		},
		
		// Update datails
		update: function( set, cb ) {
			set.vpsid = vpsid
			directvps.edit_vps( set, cb )
		},
		
		// Plan action
		// action( nameid, cb )
		// action( nameid, subval, cb )
		// action( nameid, when, cb )
		// action( nameid, cb, when )
		// action( nameid, subval, when, cb )
		action: function() {
			
			// prepare
			var vars = { vpsid: vpsid }
			
			for( var a in arguments ) {
				if( a == '0' ) {
					var nameid = arguments[a] +''
				} else if( typeof arguments[a] == 'function' ) {
					var cb = arguments[a]
				} else if( typeof arguments[a] == 'string' && arguments[a].match( /^[\d]{4}\-[\d]{2}\-[\d]{2} [\d]{2}:[\d]{2}$/ ) ) {
					vars.when = arguments[a]
				} else {
					vars.sub = arguments[a]
				}
			}
			
			// action referenced with name or ID
			if( nameid.match( /^[\d]+$/ ) ) {
				
				// ID given
				vars.actionid = nameid
				directvps.add_action( vars, cb )
				
			} else {
				
				// name, get all actions
				directvps.get_actionlist( function( actions ) {
					for( var a in actions ) {
						if( actions[a].omschrijving.toLowerCase() == nameid ) {
							
							// found the one
							vars.actionid = actions[a].actionid
							directvps.add_action( vars, cb )
							break
							
						}
					}
				})
				
			}
			
		},
		
		// Get action status
		actionStatus: function( actionRef, cb ) {
			directvps.get_actionstatus(
				{
					vpsid:			vpsid,
					planningid:		actionRef
				},
				function( res ) {
					
					var res = res[0]
					switch( res.status ) {
						case '0': res.label = 'planned'; break
						case '1': res.label = 'running'; break
						case '2': res.label = 'complete'; break
					}
					
					cb( res )
					
				}
			)
		},
		
		// start
		start: function( cb ) {
			directvps.vps( vpsid ).action( 1, cb )
		},
		
		// shutdown
		shutdown: function( force, cb ) {
			if( force && (force +'').match( /^(true|yes|1)$/i ) ) {
				directvps.vps( vpsid ).action( 9, cb )
			} else {
				directvps.vps( vpsid ).action( 2, cb )
			}
		},
		
		// Reboot
		reboot: function( force, cb ) {
			if( force && (force +'').match( /^(true|yes|1)$/i ) ) {
				directvps.vps( vpsid ).action( 10, cb )
			} else {
				directvps.vps( vpsid ).action( 3, cb )
			}
		},
		
		// Restore backup
		restore: function( backupID, cb ) {
			directvps.vps( vpsid ).action( 8, backupID, cb )
		},
		
		// List backups
		backups: function( cb ) {
			directvps.get_backuplist( vpsid, cb )
		},
		
		// Upgrade server
		upgradeProduct: function( productID, cb ) {
			directvps.vps( vpsid ).action( 13, productID, cb )
		},
		
		// Upgrade kernel
		upgradeKernel: function( kernelID, cb ) {
			directvps.vps( vpsid ).action( 12, kernelID, cb )
		},
		
		// Install DirectAdmin
		installDirectadmin: function( licenseID, cb ) {
			directvps.vps( vpsid ).action( 11, licenseID, cb )
		},
		
		// Reinstall OS
		reinstall: function( imageID, cb ) {
			directvps.vps( vpsid ).action( 6, imageID, cb )
		},
		
		// Add DirectAdmin license
		addDirectadmin: function( cb ) {
			directvps.add_da( vpsid, cb )
		},
		
		// Delete DirectAdmin license
		deleteDirectadmin: function( licenseID, cb ) {
			directvps.del_da( vpsid, licenseID, cb )
		},
		
		// Add (buy) an IPv4 address
		addIPv4: function( cb ) {
			directvps.add_ipv4( vpsid, cb )
		},
		
		// Get IPv4 address
		ipv4: function( ip, cb ) {
			
			if( !cb && typeof ip == 'function' ) {
				
				// list
				var cb = ip
				directvps.get_ipv4( vpsid, cb )
				
			} else if( ip && cb ) {
				
				// just one
				directvps.vps( vpsid ).ipv4( ip ).details( cb )
				
			}
			
			return {
				
				// simple details
				details: function( reverse, cb ) {
					if( typeof reverse === 'function' ) {
						var cb = reverse
						var reverse = false
					}
					
					directvps.get_ipv4( vpsid, function( ips ) {
						if( reverse ) {
							directvps.get_reverse( vpsid, ip, function( rev ) {
								var res = ips[ ip ]
								res.reverse = rev[0].reverse
								cb( res )
							})
						} else {
							cb( ips[ ip ] )
						}
					})
				},
				
				// get or set reverse
				reverse: function( name, cb ) {
					if( cb === undefined ) {
						
						// get
						var cb = name
						directvps.get_reverse( vpsid, ip, cb )
						
					} else {
						
						// set
						directvps.edit_reverse( vpsid, ip, reverse, cb )
						
					}
				},
				
				// delete an IPv4 address from server
				delete: function( cb ) {
					directvps.del_ipv4( vpsid, ip, cb )
				}
				
			}
			
		}
		
	}
	
}


//////////
// CORE //
//////////

// API communication
directvps.talk = function( type, path, fields, callback ) {
	
	// prepare
	var headers = {
		'Accept':	'application/json',
		'User-Agent':	'directvps.js (https://github.com/fvdm/nodejs-directvps)'
	}
	
	if( type == 'POST' ) {
		var query = []
		query.push( fields )
		var querystr = 'json='+ escape( JSON.stringify( query ) )
		
		headers['Content-Type']		= 'application/x-www-form-urlencoded'
		headers['Content-Length']	= querystr.length
	}
	
	var options = {
		host:		'api.directvps.nl',
		port:		443,
		path:		'/'+ directvps.settings.apiVersion +'/'+ path,
		method:		type,
		headers:	headers,
		key:		directvps.settings.privateKey,
		cert:		directvps.settings.certificate,
		agent:		false,
		rejectUnauthorized:	directvps.settings.verifyCert
	}
	
	// build request
	var req = https.request( options, function( response ) {
		
		// response
		var data = ''
		response.on( 'data', function( chunk ) { data += chunk })
		response.on( 'end', function() {
			
			data = data.toString('utf8').trim()
			
			// do callback if valid data
			if( data.match( /^(\{.*\}|\[.*\])$/ ) ) {
				callback( JSON.parse( data ) )
			} else {
				directvps.emit( 'fail', {'reason': 'not json'} )
			}
			
			// emit debug data
			if( directvps.settings.debug === true ) {
				var debug = {
					input: {
						type:		type,
						path:		path,
						fields:		fields
					},
					request:		options,
					response: {
						length:		data.length,
						statusCode:	response.statusCode,
						httpVersion:	response.httpVersion,
						headers:	response.headers,
						body:		data
					}
				}
				
				// replace security credentials with hashes
				var keyc = require('crypto').createHash('sha1'),
				    crtc = require('crypto').createHash('sha1')
				
				debug.request.key = keyc.update( directvps.settings.privateKey ).digest('hex')
				debug.request.cert = crtc.update( directvps.settings.certificate ).digest('hex')
				
				// send event
				directvps.emit( 'debug', debug )
			}
			
		})
		
	})
	
	// error
	req.on( 'error', function( error ) {
		directvps.emit( 'fail', error, options, fields )
	})
	
	// post and close
	if( type == 'POST' ) {
		req.write( querystr )
	}
	
	req.end()
	
}

// Ready
module.exports = directvps