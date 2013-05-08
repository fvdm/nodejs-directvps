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
    querystring = require('querystring')

// INIT
var directvps = {}

directvps.settings = {
	apiVersion:	1,
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
	
	// certificate verification
	directvps.settings.verifyCert = vars.verifyCert === true ? true : false
	
}

//////////////////////
// Direct API calls //
//////////////////////

// Get account details
directvps.get_accountdata = function( callback ) {
	directvps.talk( 'GET', 'get_accountdata', callback )
}

// Update account details
directvps.edit_accountdata = function( vars, callback ) {
	directvps.talk( 'POST', 'edit_accountdata', vars, callback )
}

// Get products
directvps.get_productlist = function( callback ) {
	directvps.talk( 'GET', 'get_productlist', function( err, res ) {
		var products = null
		if( ! err ) {
			var products = {}
			for( var p in res ) {
				var product = res[p]
				products[ product.productid ] = product
			}
		}
		callback( err, products )
	})
}

// Get ISOs
directvps.get_isolist = function( callback ) {
	directvps.talk( 'GET', 'get_isolist', function( err, res ) {
		var isos = null
		if( ! err ) {
			var isos = {}
			for( var i in res ) {
				var iso = res[i]
				isos[ iso.isoid ] = iso
			}
		})
		
		callback( err, isos )
	}
}

// Get boot orders
directvps.get_bootorderlist = function( callback ) {
	directvps.talk( 'GET', 'get_bootorderlist', function( err, res ) {
		var orders = null
		if( ! err ) {
			var orders = {}
			for( var o in res ) {
				var order = res[o]
				orders[ order.bootorderid ] = order
			}
		}
		
		callback( err, orders )
	})
}

// Get images
directvps.get_imagelist = function( callback ) {
	directvps.talk( 'GET', 'get_imagelist', function( err, res ) {
		var images = null
		if( ! err ) {
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
		}
		
		callback( err, images )
	})
}

// Get kernels
directvps.get_kernellist = function( callback ) {
	directvps.talk( 'GET', 'get_kernellist', function( err, res ) {
		var kernels = null
		if( ! err ) {
			var kernels = {}
			for( var k in res ) {
				var kernel = res[k]
				kernels[ kernel.kernelid ] = kernel
			}
		}
		
		callback( err, kernels )
	})
}

// Get locations
directvps.get_locationlist = function( callback ) {
	directvps.talk( 'GET', 'get_locationlist', function( err, res ) {
		var locations = null
		if( ! err ) {
			var locations = {}
			for( var l in res ) {
				var location = res[l]
				locations[ location.locationid ] = location
			}
		}
		
		callback( err, locations )
	})
}

// Get actions
directvps.get_actionlist = function( callback ) {
	directvps.talk( 'GET', 'get_actionlist', function( err, res ) {
		var actions = null
		if( ! err ) {
			var actions = {}
			for( var a in res ) {
				var action = res[a]
				actions[ action.actionid ] = action
			}
		}
		
		callback( err, actions )
	})
}

// Get statuses
directvps.get_statuslist = function( callback ) {
	directvps.talk( 'GET', 'get_statuslist', function( err, res ) {
		var statuses = null
		if( ! err ) {
			var statuses = {}
			for( var s in res ) {
				statuses[ res[s].statusid ] = res[s]
			}
		}
		
		callback( err, statuses )
	})
}

// Get VPS list
directvps.get_vpslist = function( callback ) {
	directvps.talk( 'GET', 'get_vpslist', function( err, res ) {
		var servers = null
		if( ! err ) {
			var servers = {}
			for( var s in res ) {
				var server = res[s]
				servers[ server.vpsid ] = server
			}
		}
		
		callback( err, servers )
	})
}

// Get backups
directvps.get_backuplist = function( vpsid, callback ) {
	directvps.talk( 'POST', 'get_backuplist', { vpsid: vpsid }, function( err, res ) {
		var backups = null
		if( ! err ) {
			var backups = {}
			for( var b in res[0].backup ) {
				backups[ res[0].backup[b].backupid ] = res[0].backup[b]
			}
		}
		
		callback( err, backups )
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
	directvps.talk( 'POST', 'get_ipv4', { vpsid: vpsid }, function( err, res ) {
		var ips = null
		if( ! err ) {
			var ips = {}
			for( var i in res[0].ip ) {
				var ip = res[0].ip[i]
				ips[ ip[0] ] = {
					ip:		res[0].ip[i][0],
					type:		res[0].ip[i][1],
					typeLabel:	res[0].ip[i][1] == '1' ? 'primary' : 'secondary'
				}
			}
		}
		
		callback( err, ips )
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

// Get IPv6 addresses
directvps.get_ipv6 = function( vpsid, callback ) {
	directvps.talk( 'POST', 'get_ipv6', {vpsid: vpsid}, function( err, res ) {
		var ips = null
		if( ! err ) {
			var ips = {}
			for( var i in res[0].ip ) {
				var ip = res[0].ip[i]
				ip.typeLabel = ip.type == '1' ? 'primary' : 'secondary'
				ips[ ip.ip ] = ip
			}
		}
		
		callback( err, ips )
	})
}

// Add IPv6 address
directvps.add_ipv6 = function( vpsid, reverse, callback ) {
	if( typeof reverse === 'function' ) {
		var callback = reverse
		var reverse = ''
	}
	
	directvps.talk( 'POST', 'add_ipv6', {vpsid: vpsid, reverse: reverse}, callback )
}

// Delete IPv4 address
directvps.del_ipv6 = function( vpsid, ipv6, callback ) {
	directvps.talk( 'POST', 'del_ipv6', {vpsid: vpsid, ipv6: ipv6}, callback )
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
	directvps.talk( 'POST', 'get_traffic', { vpsid: vpsid }, function( err, res ) {
		var result = null
		if( ! err ) {
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
		}
		
		callback( err, result )
	})
}

// Action log
directvps.get_actionlog = function( vpsid, callback ) {
	directvps.talk( 'POST', 'get_actionlog', {vpsid: vpsid}, function( err, res ) {
		var result = null
		if( ! err ) {
			var result = {}
			if( res[0].error == '0' && res[0].actionlog[0].planningid !== undefined ) {
				for( var ai in res[0].actionlog ) {
					var action = res[0].actionlog[ai]
					result[ action.planningid ] = action
				}
			}
		}
		
		callback( err, result )
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
			directvps.get_vpslist( function( err, list ) {
				if( ! err ) {
					cb( null, list[ vpsid ] )
				} else {
					cb( err )
				}
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
				directvps.get_actionlist( function( err, actions ) {
					if( ! err ) {
						for( var a in actions ) {
							if( actions[a].omschrijving.toLowerCase() == nameid ) {
								
								// found the one
								vars.actionid = actions[a].actionid
								directvps.add_action( vars, cb )
								break
								
							}
						}
					} else {
						cb( err )
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
				function( err, res ) {
					if( ! err ) {
						var res = res[0]
						switch( res.status ) {
							case '0': res.label = 'planned'; break
							case '1': res.label = 'running'; break
							case '2': res.label = 'complete'; break
						}
					}
					
					cb( err, res )
					
				}
			)
		},
		
		// Get action list
		actionLog: function( cb ) {
			directvps.get_actionlog( vpsid, cb )
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
					
					directvps.get_ipv4( vpsid, function( err, ips ) {
						if( err ) {
							cb( err )
						} else if( reverse ) {
							directvps.get_reverse( vpsid, ip, function( err, rev ) {
								var res = null
								if( ! err ) {
									var res = ips[ ip ]
									res.reverse = rev[0].reverse
								}
								
								cb( err, res )
							})
						} else {
							cb( null, ips[ ip ] )
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
	
	if( typeof fields === 'function' ) {
		var callback = fields
		var fields = {}
	}
	
	// prevent multiple callbacks
	var complete = false
	function doCallback( err, res ) {
		if( ! complete ) {
			complete = true
			callback( err, res )
		}
	}
	
	// build request
	var headers = {
		'Accept':	'application/json',
		'User-Agent':	'directvps.js (https://github.com/fvdm/nodejs-directvps)'
	}
	
	if( type == 'POST' ) {
		var query = []
		query.push( fields )
		var querystr = 'json='+ JSON.stringify( query )
		
		headers['Content-Type']		= 'application/json'
		headers['Content-Length']	= querystr.length
	}
	
	var options = {
		host:			'api.directvps.nl',
		port:			443,
		path:			'/'+ directvps.settings.apiVersion +'/'+ path,
		method:			type,
		headers:		headers,
		key:			directvps.settings.privateKey,
		cert:			directvps.settings.certificate,
		agent:			false,
		rejectUnauthorized:	directvps.settings.verifyCert
	}
	
	var request = https.request( options )
	
	// response
	request.on( 'response', function( response ) {
		var data = []
		var size = 0
		
		response.on( 'data', function( chunk ) {
			data.push( chunk )
			size += chunk.length
		})
		
		response.on( 'close', function() {
			doCallback( new Error('connection closed') )
		})
		
		response.on( 'end', function() {
			var buf = new Buffer( size )
			var pos = 0
			
			for( var d in data ) {
				data[d].copy( buf, pos )
			}
			
			data = buf.toString('utf8').trim()
			buf = null
			
			// do callback if valid data
			if( data.match( /^(\{.*\}|\[.*\])$/ ) ) {
				doCallback( null, JSON.parse( data ) )
			} else {
				err = new Error('not json')
				err.details = data
				err.responseCode = response.statusCode
				err.responseHeaders = response.headers
				err.responseBody = data
				doCallback( err )
			}
		})
	})
	
	// error
	request.on( 'error', function( error ) {
		err = new Error('request failed')
		err.details = error
		err.request = options
		err.requestData = fields
		doCallback( err )
	})
	
	// post and close
	if( type == 'POST' ) {
		request.write( querystr )
	}
	
	request.end()
}

// Ready
module.exports = directvps