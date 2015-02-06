/*
Name:         directvps.js
Description:  node.js API wrapper for DirectVPS.nl
Author:       Franklin van de Meent (https://frankl.in)
Source code:  https://github.com/fvdm/nodejs-directvps
Feedback:     https://github.com/fvdm/nodejs-directvps/issues
License:      Unlicense (Public Domain) - see UNLICENSE file

Service name: DirectVPS
Service URL:  https://directvps.nl
Service API:  https://directvps.nl/api.pdf
*/

var https = require ('https');
var querystring = require ('querystring');
var npath = require ('path');
var fs = require ('fs');

module.exports = function (setup, errCallback) {
  // Defaults
  var set = {
    timeout: 5000,
    iface: setup.iface || null,
    key: setup.key || null,
    cert: setup.cert || null,
    verify: setup.verify || false
  };

  // Read files
  if (typeof set.key === 'string' && set.key.match (/^\//)) {
    set.key = fs.readFileSync (set.key, {encoding: 'utf8'});
  }

  if (typeof set.cert === 'string' && set.cert.match (/^\//)) {
    set.cert = fs.readFileSync (set.cert, {encoding: 'utf8'});
  }

  // API
  return function (method, path, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = null;
    }

    // prevent multiple callbacks
    var complete = false;
    function doCallback (err, data) {
      if (!complete) {
        complete = true;
        callback (err, data || null);
      }
    }

    // build request
    var options = {
      host: 'api.directvps.nl',
      path: '/1'+ path,
      method: method,
      key: set.key,
      cert: set.cert,
      rejectUnauthorized: set.verify,
      secureProtocol: 'TLSv1_method',
      headers: {
        Accept: 'application/json',
        'User-Agent': 'directvps.js (https://github.com/fvdm/nodejs-directvps)'
      }
    };

    if (set.iface) {
      options.rejectUnauthorized = set.iface;
    }

    var body = null;
    if (method === 'POST') {
      body = 'json='+ escape (JSON.stringify ([params]));
      options.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      options.headers['Content-Length'] = body.length;
    }

    var request = https.request (options);

    // Response
    request.on ('response', function (response) {
      var data = [];
      var size = 0;

      response.on ('data', function (ch) {
        data.push (ch);
        size += ch.length;
      });

      response.on ('close', function () {
        doCallback (new Error ('request closed'));
      });

      response.on ('end', function () {
        data = new Buffer.concat (data, size).toString ('utf8')
        data = data.replace(/(\u0000)+$/, '').trim ();

        try {
          data = JSON.parse (data);

          if (data[0] && data[0].error && data[0].error === '1') {
            var error = new Error('API error');
            error.code = response.statusCode;
            error.text = data[0].errormessage;
            error.body = data;
            return doCallback (err);
          }

          doCallback (null, data);
        }
        catch (e) {
          var err = new Error ('not json');
          err.body = data;
          err.code = response.statusCode;
          err.headers = response.headers
          doCallback (err);
        }
      });
    });

    // Timeout
    request.on ('socket', function (socket) {
      if (typeof set.timeout === 'number') {
        socket.setTimeout (parseInt (set.timeout));
        socket.on ('timeout', function () {
          doCallback (new Error ('request timeout'));
          request.abort ();
        });
      }
    });

    // Error
    request.on ('error', function (e) {
      var err = new Error ('request failed');
      err.error = e;
      doCallback (err);
    });

    // End
    request.end (body);
  };
}
