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

var http = require ('httpreq');
var fs = require ('fs');

// Defaults
var set = {
  timeout: 5000,
  iface: null,
  key: null,
  cert: null,
  verify: true
};


/**
 * Process response
 * 
 * @callback callback
 * @param err {Error, null} - Request error
 * @param res {Object} - Response data
 * @param callback {function} - `function (err, data) {}`
 * @returns {void}
 */

function doResponse (err, res, callback) {
  var data = res && res.body || '';
  var error = null;

  try {
    data = JSON.parse (data);

    if (data [0] && data [0] .error && data [0] .error === '1') {
      error = new Error('API error');
      error.code = response.statusCode;
      error.text = data[0].errormessage;
      error.body = data;
      doCallback (err);
      return;
    }

    doCallback (null, data);
  } catch (e) {
    error = new Error ('not json');
    error.body = data;
    error.code = response.statusCode;
    error.headers = response.headers
    doCallback (error);
  }
}


/**
 * Communicate with API
 * 
 * @callback callback
 * @param method {string} - HTTP method: GET, POST, PUT, DELETE
 * @param path {string} - Request path after `/1`
 * @param [params] {object} - Request query parameters or fields
 * @param callback {function} - `function (err, data) {}`
 * @returns {void}
 */

function talk (method, path, params, callback) {
  var body = null;
  var options = {
    url: 'https://api.directvps.nl/1' + path,
    method: method,
    key: set.key,
    cert: set.cert,
    rejectUnauthorized: set.verify,
    secureProtocol: 'TLSv1_method',
    timeout: set.timeout,
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'directvps.js (https://github.com/fvdm/nodejs-directvps)'
    }
  };

  if (typeof params === 'function') {
    callback = params;
    params = null;
  }

  if (set.iface) {
    options.rejectUnauthorized = set.iface;
  }

  if (method === 'POST') {
    body = 'json=' + escape (JSON.stringify ([params]));
    options.headers ['Content-Type'] = 'application/x-www-form-urlencoded';
    options.headers ['Content-Length'] = body.length;
  }

  http.doRequest (options, function (err, res) {
    doResponse (err, res || {}, callback);
  });
};


/**
 * Module interface
 * 
 * @param setup {object} - Configuration
 * @param setup.key {string} - TLS private key or path to key
 * @param setup.cert {string} - TLS certificate or path to certificate
 * @param setup.verify {boolean=true} - Verify remote TLS certificate
 * @param setup.iface {string} - Outbound network interface or IP-address
 * @param setup.timeout {number=5000} - Wait time out in ms, 1000 = 1 sec
 * @returns talk {function}
 */

module.exports = function (setup) {
  var key;

  for (key in setup) {
    set [key] = setup [key];
  }

  // Read files
  if (typeof set.key === 'string' && set.key.match (/^\//)) {
    set.key = fs.readFileSync (set.key, {
      encoding: 'utf8'
    });
  }

  if (typeof set.cert === 'string' && set.cert.match (/^\//)) {
    set.cert = fs.readFileSync (set.cert, {
      encoding: 'utf8'
    });
  }

  // API
  return talk;
}
