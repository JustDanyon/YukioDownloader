const { webcrack } = require('webcrack');
const fetch = require('node-fetch');

// All your utility functions (transform, substitute, etc.)
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

// Include all other functions (substitute, base64_url_encode, etc.)

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