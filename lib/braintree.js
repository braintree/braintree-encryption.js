for (k in sjcl.beware) { if (sjcl.beware.hasOwnProperty(k)) { sjcl.beware[k](); } }

Braintree = {
  pidCrypt: pidCrypt,
  pidCryptUtil: pidCryptUtil,
  sjcl: sjcl
};

Braintree.create = function (publicKey) {
  var my = {
    publicKey: publicKey
  };

  var generateAesKey = function () {
    return {
      key: sjcl.random.randomWords(8, 0),
      encrypt: function(plainText) {
        var aes = new sjcl.cipher.aes(this.key);
        var iv = sjcl.random.randomWords(4, 0);
        var plainTextBits = sjcl.codec.utf8String.toBits(plainText);
        var cipherTextBits = sjcl.mode.cbc.encrypt(aes, plainTextBits, iv);
        return sjcl.codec.base64.fromBits(sjcl.bitArray.concat(iv, cipherTextBits));
      },
      encryptKeyWithRsa: function(rsaKey) {
        var encryptedKeyHex = rsaKey.encryptRaw(sjcl.codec.base64.fromBits(this.key));
        return pidCryptUtil.encodeBase64(pidCryptUtil.convertFromHex(encryptedKeyHex));
      }
    };
  };

  var rsaKey = function () {
    var key = pidCryptUtil.decodeBase64(my.publicKey);
    var rsa = new pidCrypt.RSA();
    var keyBytes = pidCryptUtil.toByteArray(key);
    var asn = pidCrypt.ASN1.decode(keyBytes);
    var tree = asn.toHexTree();
    rsa.setPublicKeyFromASN(tree);

    return rsa;
  };

  var encrypt = function (text) {
    var key = generateAesKey();
    var aesEncryptedData = key.encrypt(text);

    return "$bt2$" + key.encryptKeyWithRsa(rsaKey()) + "$" + aesEncryptedData;
  };

  return {
    encrypt: encrypt,
    publicKey: my.publicKey,
    version: '1.1.1'
  };
};
