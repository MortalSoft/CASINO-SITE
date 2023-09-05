# node-steam-crypto

Node.js implementation of Steam crypto. All keys and data are passed as Buffers.

## generateSessionKey()

Generates a 32 byte random blob of data and encrypts it with RSA using the Steam system's public key. Returns an object with the following properties:
* `plain` - the generated session key
* `encrypted` - the encrypted session key

## symmetricEncrypt(input, sessionKey)

Encrypts `input` using `sessionKey` and returns the result.

## symmetricDecrypt(input, sessionKey)

Decrypts `input` using `sessionKey` and returns the result.
