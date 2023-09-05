# Steam Web API for Node.js and io.js

This is an extremely simple node wrapper for Steam Web API. It's very experimental and the API will likely change.

# Installation

`npm install steam-web-api`

# Usage

The module exports a single `getInterface` function.

```js
var getInterface = require('steam-web-api');
```

Call it with a Web API interface name and an optional API key.

```js
var steamRemoteStorage = getInterface('ISteamRemoteStorage');
// or
var steamRemoteStorage = getInterface('ISteamRemoteStorage', 'API KEY');
```

It returns an object with two properties: `get` and `post`. Both are functions that accept the following arguments:

* Method name, e.g. `'GetCollectionDetails'`.
* Method version, e.g. `1`.
* Object with the parameters which will be serialized into a query string. Multiple values (e.g. for "publishedfileids") can be passed as arrays. Unlike other query string modules, this supports binary data (as Buffers) used in AuthenticateUser.
* Callback. The first argument is status code, the second argument is the parsed JSON response if status code is 200.

`get` sends a GET request, `post` sends a POST request. It retries automatically on network errors.

```js
steamRemoteStorage.get('GetUGCFileDetails', 1, {
  ugcid: '534000675759633498',
  appid: 767
}, function(statusCode, response) {
  if (statusCode == 200)
    console.log(response);
});

steamRemoteStorage.post('GetPublishedFileDetails', 1, {
  itemcount: 2,
  publishedfileids: ['406121458', '425876040']
}, function(statusCode, response) {
  if (statusCode == 200)
    console.log(response);
});
```
