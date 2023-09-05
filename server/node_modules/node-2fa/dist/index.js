"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.generateToken = exports.generateSecret = void 0;
const tslib_1 = require("tslib");
const notp_1 = tslib_1.__importDefault(require("notp"));
const crypto_1 = tslib_1.__importDefault(require("crypto"));
const thirty_two_1 = tslib_1.__importDefault(require("thirty-two"));
function generateSecret(options) {
    var _a;
    const config = {
        name: encodeURIComponent((_a = options === null || options === void 0 ? void 0 : options.name) !== null && _a !== void 0 ? _a : "App"),
        account: encodeURIComponent((options === null || options === void 0 ? void 0 : options.account) ? `:${options.account}` : ""),
    };
    const bin = crypto_1.default.randomBytes(20);
    const base32 = thirty_two_1.default.encode(bin).toString("utf8").replace(/=/g, "");
    const secret = base32
        .toLowerCase()
        .replace(/(\w{4})/g, "$1 ")
        .trim()
        .split(" ")
        .join("")
        .toUpperCase();
    const query = `?secret=${secret}&issuer=${config.name}`;
    const encodedQuery = query.replace('?', '%3F').replace('&', '%26');
    const uri = `otpauth://totp/${config.name}${config.account}`;
    return {
        secret,
        uri: `${uri}${query}`,
        qr: `https://chart.googleapis.com/chart?chs=166x166&chld=L|0&cht=qr&chl=${uri}${encodedQuery}`
    };
}
exports.generateSecret = generateSecret;
function generateToken(secret) {
    if (!secret || !secret.length)
        return null;
    const unformatted = secret.replace(/\W+/g, "").toUpperCase();
    const bin = thirty_two_1.default.decode(unformatted);
    return { token: notp_1.default.totp.gen(bin) };
}
exports.generateToken = generateToken;
function verifyToken(secret, token, window = 4) {
    if (!token || !token.length)
        return null;
    const unformatted = secret.replace(/\W+/g, "").toUpperCase();
    const bin = thirty_two_1.default.decode(unformatted);
    return notp_1.default.totp.verify(token.replace(/\W+/g, ""), bin, {
        window,
        time: 30,
    });
}
exports.verifyToken = verifyToken;
