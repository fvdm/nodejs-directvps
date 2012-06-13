var	fs = require('fs'),
	https = require('https'),
	EventEmitter = require('events').EventEmitter,
	querystring = require('querystring')

// INIT
var directvps = new EventEmitter()

directvps.settings = {
	apiVersion:	1
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
	directvps.talk(
		'POST',
		'get_traffic',
		{
			vpsid: vpsid
		},
		function( res ) {
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
		}
	);
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
		action: function( nameid, subkey, cb ) {
			
			// subkey is optional
			if( !cb ) {
				var cb = subkey
				var subkey = false
			}
			
			// label instead of id
			if( typeof nameid == 'string' && !nameid.match( /^\d$/ ) ) {
				
				// get all actions
				directvps.get_actionlist( function( actions ) {
					for( var a in actions ) {
						if( actions[a].omschrijving.toLowerCase() == nameid ) {
							
							// found the one
							var actionid = actions[a].actionid
							
						}
					}
				})
				
			} else {
				
				// ID given
				var actionid = nameid
				
			}
			
		}
		
	}
	
}



// API communication
directvps.talk = function( type, path, fields, callback ) {
	
	// prepare
	var headers = {
		'Accept':			'application/json',
		'User-Agent':		'directvps.js/0.1.0'
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
				data = JSON.parse( data )
				callback( data )
			})
			
		}
	)
	
	// error
	req.on( 'error', function( error ) {
		directvps.emit( 'error-talk', error, options, fields )
	})
	
	// post and close
	if( type == 'POST' ) {
		req.write( querystr )
	}
	
	req.end()
	
}

// add to cache
directvps.setCache = function( key, subkey, value ) {
	if( !value ) {
		var value = subkey
		var subkey = false
	}
	
	if( directvps.settings.cache === true ) {
		if( subkey ) {
			directvps.cache[ key ][ subkey ] = value
		} else {
			directvps.cache[ key ] = value
		}
	}
}

// Ready
module.exports = directvps