for (k in sjcl.beware) { if (sjcl.beware.hasOwnProperty(k)) { sjcl.beware[k](); } }

var Braintree = {
  sjcl: sjcl,
  version: '1.2.0'
};

Braintree.create = function (publicKey) {
  var my = {
    publicKey: publicKey
  };

  var generateAesKey = function () {
    return {
      key: sjcl.random.randomWords(8, 0),
      encrypt: function(plainText) {
        return this.encryptWithIv(plainText, sjcl.random.randomWords(4, 0));
      },
      encryptWithIv: function(plaintext, iv) {
        var aes = new sjcl.cipher.aes(this.key);
        var plaintextBits = sjcl.codec.utf8String.toBits(plaintext);
        var ciphertextBits = sjcl.mode.cbc.encrypt(aes, plaintextBits, iv);
        var ciphertextAndIvBits = sjcl.bitArray.concat(iv, ciphertextBits);
        return sjcl.codec.base64.fromBits(ciphertextAndIvBits);
      }
    };
  };

  var generateHmacKey = function () {
    return {
      key: sjcl.random.randomWords(8, 0),
      sign: function(message) {
        var hmac = new sjcl.misc.hmac(this.key, sjcl.hash.sha256);
        var signature = hmac.encrypt(message);
        return sjcl.codec.base64.fromBits(signature);
      }
    };
  };

  var extractIntegers = function (asn1) {
    var parts = [];
    if (asn1.typeName() == "INTEGER") {
      var start = asn1.posContent();
      var end = asn1.posEnd();
      var data = asn1.stream.hexDump(start, end).replace(/[ \n]/g, "");
      parts.push(data);
    }

    if (asn1.sub != null) {
      for (var i = 0; i < asn1.sub.length; i++) {
        parts = parts.concat(extractIntegers(asn1.sub[i]));
      }
    }

    return parts;
  };

  var rsaKey = function (publicKey) {
    var rawKey = b64toBA(publicKey);
    var asn1 = ASN1.decode(rawKey);
    var parts = extractIntegers(asn1);
    if (parts.length != 2) {
      throw "Malformed public key";
    }

    var modulus = parts[0];
    var exponent = parts[1];

    var rsa = new RSAKey();
    rsa.setPublic(modulus, exponent);
    return rsa;
  };

  var encrypt = function (plaintext) {
    var rsa = rsaKey(my.publicKey);
    var aes = generateAesKey();
    var hmac = generateHmacKey();
    var ciphertext = aes.encrypt(plaintext);
    var signature = hmac.sign(sjcl.codec.base64.toBits(ciphertext));
    var combinedKey = sjcl.bitArray.concat(aes.key, hmac.key);
    var encodedKey = sjcl.codec.base64.fromBits(combinedKey);
    var encryptedKey = rsa.encrypt_b64(encodedKey);
    var prefix = "$bt4|javascript_" + Braintree.version.replace(/\./g, "_") + "$";

    return prefix + encryptedKey + "$" + ciphertext + "$" + signature;
  };

  var bt = new function () {
    this.encrypt = encrypt;
    this.generateAesKey = generateAesKey;
    this.generateRsaKey = rsaKey;
    this.publicKey = my.publicKey;
    this.version = Braintree.version;
    this.formEncrypter = new Braintree.FormEncrypter(this);
    this.onSubmitEncryptForm = this.formEncrypter.onSubmitEncryptForm;
  };

  sjcl.random.startCollectors();

  return bt;
};

window.Braintree = Braintree;

if (typeof define === "function") {
  define("braintree", function () {
    return Braintree;
  });
}
