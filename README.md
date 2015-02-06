directvps
=========

Access the [DirectVPS](https://www.directvps.nl/) API with node.js

[![Build Status](https://travis-ci.org/fvdm/nodejs-directvps.svg?branch=master)](https://travis-ci.org/fvdm/nodejs-directvps)


Example
-------

```js
var directvps = require ('directvps') ({
  key: '/path/to/privatekey.pem',
  cert: '/path/to/certificate.pem'
});

// List servers in account
directvps ('GET', '/get_vpslist', function (err, list) {
  if (err) { return console.log (err); }

  list.forEach (function (vps) {
    console.log ('VPS %s allows %sGB traffic', vps.vpsid, vps.traffic);
  });
});
```


Installation
------------

Stable: `npm install directvps`

Develop: `npm install fvdm/nodejs-directvps#develop`


Setup ( settings, [errCallback] )
-----

In order to use the API you need to have a private-key and certificate.
Refer to the documentation for details.


Param       | Type     | Required | Description
------------|----------|----------|--------------------------------------------
settings    | object   | yes      | see [Settings](#settings) below
errCallback | function | no       | function to catch key/cert file read errors


#### Settings

Name    | Type    | Required | Default | Description                     
--------|---------|----------|---------|--------------------------------------
key     | string  | yes      | null    | The private-key text or absolute path
cert    | string  | yes      | null    | The certificate text or absolute path
verify  | boolean | no       | false   | Validate server certificate
timeout | integer | no       | 5000    | Request wait timeout in ms


```js
var directvps = require ('directvps') ({
  key: '/path/to/privatekey.pem',
  cert: '/path/to/certificate.pem',
  timeout: 10000
});
```


Usage ( method, path, [params], callback )
-----

The module is a _function_ for the [Setup](#setup) which returns another _function_ for all API calls.


#### Arguments

name     | type     | required | description
---------|----------|----------|---------------------------------------------------
method   | string   | yes      | `GET` or `POST`
path     | string   | yes      | i.e. `/get_vpslist`
params   | object   | no       | i.e. `{vpsid: '123'}`
callback | function | yes      | function to receive result: `function (err, data)`


```js
var input {
  vpsid: '123',
  ipv6: '2a02:2308::1b:1:127',
  reverse: 'myhostname.net'
};

directvps ('POST', '/add_ipv6', input, processResult);
```

License
-------

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


Author
------

Franklin van de Meent
| [Website](https://frankl.in)
| [Github](https://github.com/fvdm)
