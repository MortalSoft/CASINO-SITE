# Steam WebLogOn

WebLogOn implementation for [node-steam](https://github.com/seishun/node-steam) 1.x.

# Installation

```
npm install steam-weblogon
```

# Usage

Instantiate a `SteamWebLogOn` object.

```js
var SteamWebLogOn = require('steam-weblogon');
var steamWebLogOn = new SteamWebLogOn(steamClient, steamUser);
```

Here `steamClient` is a `SteamClient` instance and `steamUser` is a `SteamUser` instance.

Call `webLogOn` after log in, for example in callback of `logOnResponse` event of `steamClient`:

```js
steamClient.on('logOnResponse', function(logonResp) {
  if (logonResp.eresult == Steam.EResult.OK) {
    steamWebLogOn.webLogOn(function(webSessionID, cookies){
      ...
    });
  }
});
```

# API

## Methods

### webLogOn(callback)

Logs into Steam Community. You only need this if you know you do. `callback` will be called with your new `webSessionID` and an array of your new cookies (as strings).

Feel free to call this whenever you need to refresh your web session - for example, if you log into the same account from a browser on another computer.

# License

The original implementation by __seishun__ is from [node-steam#182](https://github.com/seishun/node-steam/issues/182#issuecomment-122006314).

MIT
