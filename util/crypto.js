var crypto = require('crypto')
function cryptoFromSHA1(content) {
    var crypto = require('crypto');
    var shasum = crypto.createHash('sha1');
    shasum.update(content);
    return shasum.digest('hex');
}

exports.cryptoFromSHA1 = cryptoFromSHA1