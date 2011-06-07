describe("Braintree", function () {
  it("has a public encryption key", function () {
    var braintree = Braintree.create("a public key");
    expect(braintree.publicKey).toMatch("a public key");
  });

  describe("encrypt", function () {
    var privateKey = "MIICXgIBAAKBgQsuU3jiFN8sWjjk/CvhpBUuKTVvDdAN7+3P+PAJxkeuq/c+/+F2KeW8aW4ABmtO6y+TYtvJCVtha/mx4rr9RnUa309sBekaXV3gjk5j91/z2/PNzmvuHnn2YAOUZhOM/2za+triLlm/h52quyoEL5B5wH3XgxAaWRxiHvLH66B1BwIDAQABAoGBCc4ACNtIrkP4gjfbIqfl+WTXYjIWjMIMCiD8DZKku6tixZgLTy0NpJZKZdnDx0oXV0sJv+5VNDsEMpxZVNxRcs3V8UTDJZu6QnKLkH3gGP9kfSMncfrz1jt1riBBd0PKGkgGU3FxjEIq7EawTv/xus7A+K2RLPZePAEN57N6tWvhAkEDb9B8NhAenON3FiN9IraCKAvRnHgbZOaJhFV+zaGIzv0bxx1GivQ9eHPmk0xPlx2k9hfPm0FcmqntgDxlcuNl/wJBA0DaMoeO79UMWwcicM08n39OHEzxD0DhZBeRcTVhJWMOntVBFDwkgBgPrrNEOFs2s8ZdhThXsTr5soCUL44NwPkCQQDYN9puxuNfFx+rFymnoEa4ZL8svu+simN9XC1/h5VBmT58Xpt5hrCcq48c4AInVye1OwDQXO3PLLerbixYYb4tAkAsh34MIWhRS8fSKdU+I++jLtn0gy79mQ9w8yXKZNdK5I05ebFLRehTYQNGMm+Q8OvLv1RQHuAq9w7EMSgZwEKBAkECZ3PhNh7S8KIPyrVjzdQZP+XXvpZj7yZbKosskk2cFUUc5zXOgIrMXCu2hyMWZF1qxKYHus5z1hbo3oNMYDeDrQ==";

    var publicKey = "MIGJAoGBCy5TeOIU3yxaOOT8K+GkFS4pNW8N0A3v7c/48AnGR66r9z7/4XYp5bxpbgAGa07rL5Ni28kJW2Fr+bHiuv1GdRrfT2wF6RpdXeCOTmP3X/Pb883Oa+4eefZgA5RmE4z/bNr62uIuWb+Hnaq7KgQvkHnAfdeDEBpZHGIe8sfroHUHAgMBAAE=";

    var decrypt = function (value) {
      var key = Braintree.pidCryptUtil.decodeBase64(privateKey);
      var rsa = new Braintree.pidCrypt.RSA();
      var asn = Braintree.pidCrypt.ASN1.decode(Braintree.pidCryptUtil.toByteArray(key));
      var tree = asn.toHexTree();
      rsa.setPrivateKeyFromASN(tree);

      var aesKeyAndCipherText = value.substring("$bt2$".length);
      var cryptedAesKey = aesKeyAndCipherText.split('$')[0];
      var ivAndCipherText = aesKeyAndCipherText.split('$')[1];
      var aesKey = rsa.decryptRaw(Braintree.pidCryptUtil.convertToHex(Braintree.pidCryptUtil.decodeBase64(cryptedAesKey)));
      var aesKeyBits = Braintree.sjcl.codec.base64.toBits(aesKey);
      var aes = new Braintree.sjcl.cipher.aes(aesKeyBits);

      var ivAndCipherTextBits = Braintree.sjcl.codec.base64.toBits(ivAndCipherText);
      var ivBits = ivAndCipherTextBits.slice(0,4);
      var cipherTextBits = ivAndCipherTextBits.slice(4);

      var plainTextBits = Braintree.sjcl.mode.cbc.decrypt(aes, cipherTextBits, ivBits);
      var plainText = Braintree.sjcl.codec.utf8String.fromBits(plainTextBits);

      return plainText;
    };

    it("encrypts the given text with the public key", function () {
      var braintree = Braintree.create(publicKey);
      var encrypted = braintree.encrypt("test data");

      expect(decrypt(encrypted)).toEqual("test data");
    });

    it("encrypts the given lengthy text with the public key", function () {
      var braintree = Braintree.create(publicKey);
      var plainText = "lengthy test data lenghty test data lengthy test data 123456";
      var encrypted = braintree.encrypt(plainText);

      expect(decrypt(encrypted)).toEqual(plainText);
    });

    it("prepends the encrypted data with $bt2$", function () {
      var braintree = Braintree.create(publicKey);
      var encrypted = braintree.encrypt("test data");

      expect(encrypted).toMatch(/^\$bt2\$/);
    });
  });
});
