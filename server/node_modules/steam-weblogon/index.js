var crypto = require('crypto');

var getInterface = require('steam-web-api');
var SteamCrypto = require('steam-crypto');

var SteamEResultOK = 1;

function handleLogOnResponse (logOnResponse) {
  if (logOnResponse.eresult === SteamEResultOK) {
    this._webLoginKey = logOnResponse.webapi_authenticate_user_nonce;
  }
}

function SteamWebLogOn (steamClient, steamUser) {
  this._steamClient = steamClient;
  this._steamUser = steamUser;
  this._retryTimeout = null;

  this._steamClient.on('logOnResponse', handleLogOnResponse.bind(this));
}

SteamWebLogOn.prototype.webLogOn = function (callback) {
  clearTimeout(this._retryTimeout);

  var sessionKey = SteamCrypto.generateSessionKey();

  getInterface('ISteamUserAuth').post('AuthenticateUser', 1, {
    steamid: this._steamClient.steamID,
    sessionkey: sessionKey.encrypted,
    encrypted_loginkey: SteamCrypto.symmetricEncrypt(
      new Buffer(this._webLoginKey),
      sessionKey.plain
    )
  }, function (statusCode, body) {
    if (statusCode !== 200) {
      this._retryTimeout = setTimeout(function () {
        // request a new login key first
        this._steamUser.requestWebAPIAuthenticateUserNonce(function (nonce) {
          this._webLoginKey = nonce.webapi_authenticate_user_nonce;
          this.webLogOn(callback);
        }.bind(this));
      }.bind(this), 5000);

      return;
    }

    this.sessionID = crypto.randomBytes(12).toString('hex');
    this.cookies = [
      'sessionid=' + this.sessionID,
      'steamLogin=' + body.authenticateuser.token,
      'steamLoginSecure=' + body.authenticateuser.tokensecure
    ];

    callback(this.sessionID, this.cookies);
  }.bind(this));
};

module.exports = SteamWebLogOn;
