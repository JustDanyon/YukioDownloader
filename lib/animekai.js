const { webcrack } = require('webcrack');
const fetch = require('node-fetch');

function transform(n, t) {
    var s = [], j = 0, x, res = '';
    for (var i = 0; i < 256; i++) {
        s[i] = i;
    }
    for (i = 0; i < 256; i++) {
        j = (j + s[i] + n.charCodeAt(i % n.length)) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
    }
    i = 0;
    j = 0;
    for (var y = 0; y < t.length; y++) {
        i = (i + 1) % 256;
        j = (j + s[i]) % 256;
        x = s[i];
        s[i] = s[j];
        s[j] = x;
        res += String.fromCharCode(t.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
    }
    return res;
}

function substitute(str, pattern, replacement) {
    return str.replace(pattern, replacement);
}

function base64_url_encode(data) {
    return Buffer.from(data).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64_url_decode(base64url) {
    let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
        base64 += '=';
    }
    return Buffer.from(base64, 'base64').toString();
}

function reverse_it(str) {
    return str.split('').reverse().join('');
}

// Load the functions from kai.json
const kaiFunctions = require('./kai.json');

// Helper function to evaluate encoded functions
function evaluate(funcName, param) {
    const funcBody = kaiFunctions[funcName];
    return eval(`(${funcBody})`)(param);
}

module.exports = {
    transform,
    substitute,
    base64_url_encode,
    base64_url_decode,
    reverse_it,
    evaluate,
    fetch
};