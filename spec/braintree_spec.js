describe("Braintree", function () {
  var publicKey =
    "MIIBCgKCAQEA8wQ3PXFYuBn9RBtOK3lW4V+7HNjik7FFd0qpPsCVd4KeiIfhuzupSevHUOLjbRSqwvAaZK3/icbBaM7CMAR5y0OjAR5lmmEEkc" +
    "w+A7pmKQK6XQ8j3fveJCzC3MPiNiFfr+vER7O4diTxGhoXjFFJQpzKkCwFgwhKrW8uJLmWqVhQRVNphii1GpxI4fjFNc4h1w2W2CJ9kkv+9e3B" +
    "nCpdVe1w7gBQZMkgjCzxbuAg8XaKlKD48M9kr8iE8kNt1eXV0jbmhCY3vZrckCUv26r2X4cD5lDvUtC1Gj6jBFobm/MelAfoFqNeq+/9VyMdYf" +
    "hIecQimiBYr7Vm5VH9m69TXwIDAQAB";

  it("has a public encryption key", function () {
    var braintree = Braintree.create("a public key");
    expect(braintree.publicKey).toMatch("a public key");
  });

  it("can be instantiated directly", function () {
    var braintree = new Braintree.EncryptionClient("a public key");
    expect(braintree.publicKey).toMatch("a public key");
  });

  it("encrypts with a known AES key", function() {
    var braintree = Braintree.create(publicKey);
    var key = Braintree.generateAesKey();
    key.key = [-1958853821,973037212,398302960,1668515393,356607281,1582615236,558457690,-1305749256]
    expect(key.encryptWithIv("test data", [1, 2, 3, 4])).toEqual("AAAAAQAAAAIAAAADAAAABJcSo857BMv+cJtJfpF5Pak=");
  });

  it("encrypts with another known AES key", function() {
    var braintree = Braintree.create(publicKey);
    var key = Braintree.generateAesKey();
    key.key = [-1958853821,973037212,398302960,1668515393,356607281,1582615236,558457690,-1305749256]
    expect(key.encryptWithIv("test data", [-320125304, 1018604835, -1358544460, 837200435])).toEqual("7OtGiDy2rSOvBkG0MeaqMzCOxy049Z8+7j33YHFKJ3E=");
  });

  describe("encrypt", function () {
    var publicExponent = "010001"
    var publicModulus = "00F304373D7158B819FD441B4E2B7956E15FBB1CD8E293B145774AA93EC09577829E8887E1BB3BA949EBC750E2E36D14AAC2F01A64ADFF89C6C168CEC2300479CB43A3011E659A610491CC3E03BA662902BA5D0F23DDFBDE242CC2DCC3E236215FAFEBC447B3B87624F11A1A178C5149429CCA902C0583084AAD6F2E24B996A958504553698628B51A9C48E1F8C535CE21D70D96D8227D924BFEF5EDC19C2A5D55ED70EE005064C9208C2CF16EE020F1768A94A0F8F0CF64AFC884F2436DD5E5D5D236E6842637BD9ADC90252FDBAAF65F8703E650EF52D0B51A3EA3045A1B9BF31E9407E816A35EABEFFD57231D61F84879C4229A2058AFB566E551FD9BAF535F"
    var privateExponent = "BCBFFD2C93CABC767684BBFF8ED52BCDED804AA5D1945CC6DE5BA9E1901459257122C97AA877448DB2282C711BA5F1CD7CA7DE0F32865F7B93190739EF8766880C321C1325D916F146E88D52ED95867426B6E2278C56B470B33081A8CBEE76FE9F5F6758AC7B909D2AD9A7FC7C33EBF691A0117C9EC51B4C11D915DE108EDEE4310343255FFEB52CAE06B2C93B8655DC370EA4E1F211B7DC40367377294AC6218B6668293D90AB17F07856F72AD59B45965C79F39BAA393BEDC178FFB77167BE3477912445445F020FA96B5D41AE9ED210ED2E90903CE4A5A6BE32247B2C4F6047A643DA1E2E8E9C62076B41C3EE26F27F07352908DCC00F2383839A6E64FB1"
    var privatePrime1 = "00FF66359B5CC6E41D2707D322C6EFF72BB77E158A41AE54CA125274AC535C34182FB77D9D3C10FA13A66B2FC3289174B2F07AE1851E1EA506289727C71EDA73BDAD6067C5D13B5C193BEF937C9C1F51DD5EA4319C74C39FC3EF9D6455B511A5AB9C2DD83F1AEF7DDFC3BA29705E0D5051BF5A2225C2329990C3FB26D15364DB27"
    var privatePrime2 = "00F3968CCC2491DA930D8A9F560D09ECACFFBA9D88524F706B265240C0B36B592F734057D72EFB9F209D0E42474FDA600CF7237DBD5F05980B7B09200F63652C32F2A9AE2CAFE6F96A65917B57032BD5B39A20E965040F88218FF1DDCEE2179133B75849C8D7A08E6B6CF85CF7F46E8F375583AC219C99C65B5CE11886CD9EC909"
    var privateExponent1 = "0080036A213A6A92922E2B14E01C98D0EA3FA9DA001795DAF80221044C0FE86A502932AEAAAE1DD04B23221CA9945EFC0068DB1EC8CB650ED03C6E2F48F62506D86EDBA0881DACC427FDCBC2C035BCD91ABD424D7F9F6322646269208E7918A4529510C19037DF0CD7A8D259CCF1C77897D0F2CBA4E366DB641D67787879755707"
    var privateExponent2 = "2DF550B94F8909514773C91E463582271DD4CAD62699805F670A8BD70FC3083FB0A20A30BA57952D651484A2C9C92CE82554D7EB7BDB2555BD2FFA918CB2510587CD45E47E87B8B53F56948BD53857089CE2EAC6395EE8D354425114308A3BC62328903B499BAC634E5B09C76AA1D5799E33CAAD48CBA6A6243F000EA70AF769"
    var privateCoefficient = "689EF91E57935B742047539E763F6991CD1D1E9F9F97A5140AE044DE9F8B1C7CDA44037E031A7906ED396E19F11C430D478685CD754B57E295F5594F60C76B2A102EBE8E454FE73838477BA29E76C50D172D48460A11D528BED98D60DC88EBC6A00515D9A004DB3173524CA055033097B62A5685DE7124DCE5AE3DCFC0E46D76"

    var getRsaPrivateKey = function() {
      var rsa = new RSAKey();
      rsa.setPrivateEx(publicModulus, publicExponent, privateExponent, privatePrime1, privatePrime2, privateExponent1, privateExponent2, privateCoefficient);
      return rsa;
    }

    var formattedBraintreeVersion = Braintree.version.replace(/\./g, "_");
    var prefixRegExp = new RegExp("^\\$bt4\\|javascript_" + formattedBraintreeVersion + "\\$");

    var decrypt = function (value) {
      var rsa = getRsaPrivateKey();
      var body = value.replace(prefixRegExp, "");
      var parts = body.split('$')
      var encryptedKey = b64tohex(parts[0]);
      var ciphertext = Braintree.sjcl.codec.base64.toBits(parts[1]);
      var receivedSignature = Braintree.sjcl.codec.base64.toBits(parts[2]);

      var encodedKey = rsa.decrypt(encryptedKey);
      var rawKey = Braintree.sjcl.codec.base64.toBits(encodedKey);
      var aesKey = Braintree.sjcl.bitArray.bitSlice(rawKey, 0, 256);
      var hmacKey = Braintree.sjcl.bitArray.bitSlice(rawKey, 256);

      var hmac = new Braintree.sjcl.misc.hmac(hmacKey, Braintree.sjcl.hash.sha256);
      var computedSignature = hmac.encrypt(ciphertext);

      if (!Braintree.sjcl.bitArray.equal(receivedSignature, computedSignature)) {
        throw "Invalid MAC";
      }

      var aes = new Braintree.sjcl.cipher.aes(aesKey);
      var iv = ciphertext.slice(0, 4);
      ciphertext = ciphertext.slice(4);

      var plaintext = Braintree.sjcl.mode.cbc.decrypt(aes, ciphertext, iv);
      return Braintree.sjcl.codec.utf8String.fromBits(plaintext);
    }

    describe("handles malformed public keys", function () {
      it("when the exponent and modulus can't be extracted", function () {
        expect(function () {
          var braintree = Braintree.create("MAUCAwEAAQ==")
          braintree.encrypt("test data");
        }).toThrow("Invalid encryption key. Please use the key labeled 'Client-Side Encryption Key'");
      });

      it("when they can't be decoded", function () {
        expect(function () {
          var braintree = Braintree.create("36baf98243cc6709c3a60ba194881asd")
          braintree.encrypt("test data");
        }).toThrow("Invalid encryption key. Please use the key labeled 'Client-Side Encryption Key'");
      });
    });

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

    it("prepends the encrypted data with $bt4 and agent", function () {
      var braintree = Braintree.create(publicKey);
      var encrypted = braintree.encrypt("test data");

      expect(encrypted).toMatch(prefixRegExp);
    });
  });
});
