var	fs = require('fs'),
	https = require('https'),
	EventEmitter = require('events').EventEmitter,
	querystring = require('querystring')

// INIT
var directvps = new EventEmitter()

directvps.settings = {
	apiVersion:	1,
	debug:		false
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
	});
}

// Get images
directvps.get_imagelist = function( callback ) {
	directvps.talk( 'GET', 'get_imagelist', {}, function( res ) {
		var images = {}
		for( var i in res ) {
			var image = res[i]
			images[ image.imageid ] = image
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
		callback( servers )
	})
}

// Get backups
directvps.get_backuplist = function( vpsid, callback ) {
	directvps.talk( 'POST', 'get_backuplist', { vpsid: vpsid }, function( res ) {
		var backups = {}
		for( var b in res[0].backup ) {
			backups[ res[0].backup[b].backupid ] = res[0].backup[b]
		}
		callback( backups );
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
		var ips = []
		for( var i in res[0].ip ) {
			// bypass json bug
			ips.push({
				ip:			res[0].ip[i][0],
				type:		res[0].ip[i][1],
				typeLabel:	res[0].ip[i][1] == '1' ? 'primary' : 'secondary'
			})
		}
		callback( ips )
	})
}

// Add (buy) IPv4 address
directvps.add_ipv4 = function( vpsid, callback ) {
	directvps.talk( 'POST', 'add_ipv4', { vpsid: vpsid }, callback )
}

// Delete IPv4 address
directvps.del_ipv4 = function( set, callback ) {
	directvps.talk( 'POST', 'del_ipv4', set, callback )
}

// Add DirectAdmin license
directvps.add_da = function( vpsid, callback ) {
	directvps.talk( 'POST', 'add_da', { vpsid: vpsid }, callback )
}

// Delete DirectAdmin license
directvps.del_da = function( set, callback ) {
	directvps.talk( 'POST', 'del_da', set, callback )
}

// Get IP reverse address
directvps.get_reverse = function( set, callback ) {
	directvps.talk( 'POST', 'get_reverse', set, callback )
}

// Edit IP reverse address
directvps.edit_reverse = function( set, callback ) {
	directvps.talk( 'POST', 'edit_reverse', set, callback )
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
	});
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
			if( set.vpsid === undefined ) {
				set.vpsid = vpsid
			}
			directvps.edit_vps( set, cb )
		},
		
		// Plan action
		// action( nameid, cb )
		// action( nameid, subval, cb )
		// action( nameid, when, cb )
		// action( nameid, cb, when )
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
					vpsid: vpsid,
					planningid: actionRef
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
		
		// Backups
		backups: function( cb ) {
			directvps.get_backuplist( vpsid, cb )
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
		'Accept':			'application/json',
		'User-Agent':		'directvps.js (https://github.com/fvdm/nodejs-directvps)'
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
		agent:		false
	}
	
	// build request
	var req = https.request( options, function( response ) {
			
			// response
			response.setEncoding('utf8')
			var data = ''
			
			response.on( 'data', function( chunk ) { data += chunk });
			response.on( 'end', function() {
				
				// cleanup
				data = data.replace( /^[\r\n\t\s ]+|[\r\n\t\s]+$/, '' )
				
				// do callback if valid data
				var	first = data.substr(0,1),
					last = data.substr( data.length -1, 1 )
				
				if( (first == '[' && last == ']') || (first == '{' && last == '}') ) {
					callback( JSON.parse( data ) )
				} else {
					directvps.emit( 'fail', {
						'reason':	'not json'
					})
				}
				
				// emit debug data
				if( directvps.settings.debug === true ) {
					directvps.emit( 'debug', {
						input: {
							type:		type,
							path:		path,
							fields:		fields
						},
						request:	options,
						response: {
							length:		data.length,
							statusCode:	response.statusCode,
							httpVersion:	response.httpVersion,
							headers:	response.headers,
							body:		data
						}
					})
				}
				
			})
			
		}
	)
	
	// error
	req.on( 'error', function( error ) {
		directvps.emit( 'fatal', error, options, fields )
	})
	
	// post and close
	if( type == 'POST' ) {
		req.write( querystr )
	}
	
	req.end()
	
}

// Ready
module.exports = directvps