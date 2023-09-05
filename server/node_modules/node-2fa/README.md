# node-2fa

Easy 2-Factor Integration For Node.js

There are a number of applications which support 2-Factor Authentication, namely

- Authy [iPhone](https://itunes.apple.com/us/app/authy/id494168017?mt=8) | [Android](https://play.google.com/store/apps/details?id=com.authy.authy&hl=en) | [Chrome](https://chrome.google.com/webstore/detail/authy/gaedmjdfmmahhbjefcbgaolhhanlaolb?hl=en) | [Linux](https://www.authy.com/personal/) | [OS X](https://www.authy.com/personal/) | [BlackBerry](https://appworld.blackberry.com/webstore/content/38831914/?countrycode=US&lang=en)
- Google Authenticator [iPhone](https://itunes.apple.com/us/app/google-authenticator/id388497605?mt=8) | [Android](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en)
- Microsoft Authenticator [Windows Phone](https://www.microsoft.com/en-us/store/apps/authenticator/9wzdncrfj3rj) | [Android](https://play.google.com/store/apps/details?id=com.microsoft.msa.authenticator)

This module uses [`notp`](https://github.com/guyht/notp) which implements `TOTP` [(RFC 6238)](https://www.ietf.org/rfc/rfc6238.txt)
(the _Authenticator_ standard), which is based on `HOTP` [(RFC 4226)](https://www.ietf.org/rfc/rfc4226.txt)
to provide codes that are exactly compatible with all other _Authenticator_ apps and services that use them.

Usage
=====

```bash
npm install node-2fa --save
```

```javascript
const twofactor = require("node-2fa");

const newSecret = twofactor.generateSecret({ name: "My Awesome App", account: "johndoe" });
/*
{ secret: 'XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W',
  uri: 'otpauth://totp/My%20Awesome%20App:johndoe?secret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W&issuer=My%20Awesome%20App',
  qr: 'https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=otpauth://totp/My%20Awesome%20App:johndoe%3Fsecret=XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W%26issuer=My%20Awesome%20App'
}
*/

const newToken = twofactor.generateToken("XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W");
// => { token: '630618' }

twofactor.verifyToken("XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W", "630618");
// => { delta: 0 }

twofactor.verifyToken("XDQXYCP5AC6FA32FQXDGJSPBIDYNKK5W", "00");
// => null
```

## API

### generateSecret(options)

returns an object containing a 32-character secret (keep user specific, store in DB), a uri (if you want to make your own QR / barcode) and a direct link to a QR code served via HTTPS by the Google Chart API

options is an object containing `name` which is the name of your app that will show up when the user scans the QR code and `account` which can be the username and will also show up in the user's app. Both parameters are optional

### generateToken(secret)

returns an object containing a 6-character token

### verifyToken(secret, token, window)

checks if a time-based token matches a token from secret key within a +/- _window_ (default: 4) minute window

returns either `null` if the token does not match, or an object containing delta key, which is an integer of how for behind / forward the code time sync is in terms of how many new codes have been generated since entry

ex.
`{delta: -1}` means that the client entered the key too late (a newer key was meant to be used).
`{delta: 1}` means the client entered the key too early (an older key was meant to be used).
`{delta: 0}` means the client was within the time frame of the current key.

## _n_-Minute Window

The window is set to 4 by default. Each token is valid for a total of _n_ minutes to account for time drift.
