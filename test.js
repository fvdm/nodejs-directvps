/*
Name:         test.js
Description:  Test script for directvps.js
Author:       Franklin van de Meent (https://frankl.in)
Source code:  https://github.com/fvdm/nodejs-directvps
Feedback:     https://github.com/fvdm/nodejs-directvps/issues
License:      Unlicense (Public Domain) - see UNLICENSE file

Service name: DirectVPS
Service URL:  https://directvps.nl
Service API:  https://directvps.nl/api.pdf
*/

var testStart = Date.now ();
var util = require ('util');

// Setup
// set env CERTIFICATE and PRIVATEKEY (Travis CI)
var acc = {
  key: process.env.KEY || null,
  cert: process.env.CERT || null,
  timeout: process.env.TIMEOUT || 5000,
  verify: process.env.VERIFY ? true : false
}

var testData = {
  vpsid: process.env.VPSID || null,
  ipv6: process.env.IPV6 || null
}

var app;

// handle exits
var errors = 0;
process.on ('exit', function () {
  var testTime = Date.now () - testStart;
  if (errors === 0) {
    console.log ('\n\033[1mDONE, no errors.\033[0m');
    console.log ('Timing: \033[33m%s ms\033[0m\n', testTime);
    process.exit (0);
  } else {
    console.log ('\n\033[1mFAIL, '+ errors +' error'+ (errors > 1 ? 's' : '') +' occurred!\033[0m');
    console.log ('Timing: \033[33m%s ms\033[0m\n', testTime);
    process.exit (1);
  }
});

// prevent errors from killing the process
process.on ('uncaughtException', function (err) {
  console.log ();
  console.error (err.stack);
  console.trace ();
  console.log ();
  errors++;
});

// Queue to prevent flooding
var queue = [];
var next = 0;

function doNext () {
  next++;
  if (queue[next]) {
    queue[next] ();
  }
}

// doTest (passErr, 'methods', [
//   ['feeds', typeof feeds === 'object']
// ]);
function doTest (err, label, tests) {
  if (err instanceof Error) {
    console.error (label +': \033[1m\033[31mERROR\033[0m\n');
    console.error (util.inspect (err, false, 10, true));
    console.log ();
    console.error (err.stack);
    console.log ();
    errors++;
  } else {
    var testErrors = [];
    tests.forEach (function (test) {
      if (test[1] !== true) {
        testErrors.push (test[0]);
        errors++;
      }
    });

    if (testErrors.length === 0) {
      console.log (label +': \033[1m\033[32mok\033[0m');
    } else {
      console.error (label +': \033[1m\033[31mfailed\033[0m ('+ testErrors.join (', ') +')');
    }
  }

  doNext ();
}


if (process.env.CERTU && process.env.KEYU) {
  get (process.env.KEYU, function (err, data) {
    if (err) { return console.log ('http failed'); }
    acc.key = data;
    if (acc.cert && next === 0) {
      app = require ('./') (acc);
      queue[0]();
    }
  });
  get (process.env.CERTU, function (err, data) {
    if (err) { return console.log ('http failed'); }
    acc.cert = data;
    if (acc.key && next === 0) {
      app = require ('./') (acc);
      queue[0]();
    }
  });
} else {
  var app = require ('./') (acc);
  queue[0]();
}


// First check API access
queue.push (function () {
  app ('GET', '/get_statuslist', function (err, data) {
    if (err) {
      console.log ('API access: failed ('+ err.message +')');
      console.log (err.stack);
      errors++;
      process.exit (1);
    } else {
      console.log ('API access: \033[1m\033[32mok\033[0m');
      doTest (err, 'GET array', [
        ['type', data && data instanceof Array],
        ['item', data && data[0] instanceof Object],
        ['prop', data && data[0] && typeof data[0].omschrijving === 'string']
      ]);
      doNext ();
    }
  });
});

queue.push (function () {
  var input = {
    vpsid: testData.vpsid,
    ipv6: testData.ipv6,
    reverse: 'TEST-NODE-JS-IPV6.net'
  };
  app ('POST', '/add_ipv6', input, function (err, data) {
    doTest (err, 'POST object', [
      ['type', data && data instanceof Array],
      ['status', data && data[0] && data[0].error === '0']
    ]);
  });
});

queue.push (function () {
  var input = {
    vpsid: testData.vpsid,
    ipv6: testData.ipv6
  }
  app ('POST', '/del_ipv6', input, function (err, data) {
    doTest (err, 'POST delete', [
      ['type', data && data instanceof Array],
      ['status', data && data[0] && data[0].error === '0']
    ]);
  });
})


// HTTP GET
function get (url, cb) {
  var proto = url.match (/^https:/) ? 'https' : 'http';
  require (proto).get (url, function (response) {
    var data = [];
    var size = 0;
    response.on ('data', function (ch) {
      data.push (ch);
      size += ch.length;
    });
    response.on ('end', function () {
      data = new Buffer.concat (data, size).toString ('utf8').trim ();
      if (data === '') {
        return cb (new Error('Test: http empty'));
      }
      if (response.statusCode >= 300) {
        var err = new Error('Test: http error');
        err.code = response.statusCode;
        return cb (err);
      }
      cb (null, data);
    });
  });
}
