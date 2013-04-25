for (var k in sjcl.beware) { if (sjcl.beware.hasOwnProperty(k)) { sjcl.beware[k](); } }

var Braintree = {
  sjcl: sjcl,
  version: '1.3.0'
};

Braintree.generateAesKey = function () {
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

Braintree.create = function (publicKey) {
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

  var generateRsaKey = function () {
    try {
      var rawKey = b64toBA(publicKey);
      var asn1 = ASN1.decode(rawKey);
    } catch (e) {
      throw "Invalid encryption key. Please use the key labeled 'Client-Side Encryption Key'";
    }
    var parts = extractIntegers(asn1);
    if (parts.length != 2) {
      throw "Invalid encryption key. Please use the key labeled 'Client-Side Encryption Key'";
    }

    var modulus = parts[0];
    var exponent = parts[1];

    var rsa = new RSAKey();
    rsa.setPublic(modulus, exponent);
    return rsa;
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

  var encrypt = function (plaintext) {
    var rsa = generateRsaKey();
    var aes = Braintree.generateAesKey();
    var hmac = generateHmacKey();
    var ciphertext = aes.encrypt(plaintext);
    var signature = hmac.sign(sjcl.codec.base64.toBits(ciphertext));
    var combinedKey = sjcl.bitArray.concat(aes.key, hmac.key);
    var encodedKey = sjcl.codec.base64.fromBits(combinedKey);
    var encryptedKey = rsa.encrypt_b64(encodedKey);
    var prefix = "$bt4|javascript_" + bt.version.replace(/\./g, "_") + "$";

    return prefix + encryptedKey + "$" + ciphertext + "$" + signature;
  };

  var inputElements = function(form) {
    var inputChildren, inputs;

    inputs = [];
    inputChildren = function(elem) {
      for (var i = 0, e; i < elem.children.length; i++) {
        e = elem.children[i];
        if (e.attributes['data-encrypted-name']) {
          inputs.push(e);
        } else {
          inputChildren(e);
        }
      }
    };
    inputChildren(form);
    return inputs;
  };

  var createElement = function(tagName, attrs) {
    var element, k, v;

    element = document.createElement(tagName);
    for (k in attrs) {
      v = attrs[k];
      element.setAttribute(k, v);
    }
    return element;
  };

  var extractForm = function(object) {
    if (window.jQuery && object instanceof jQuery) {
      return object[0];
    } else if (object.nodeType && object.nodeType === 1) {
      return object;
    } else {
      return document.getElementById(object);
    }
  };

  var encryptForm = function(form) {
    var element, encryptedValue, fieldName, hiddenField, i, inputs;

    form = extractForm(form);
    inputs = inputElements(form);
    for (i = 0; i < inputs.length; i++) {
      element = inputs[i];
      fieldName = element.getAttribute('data-encrypted-name');
      encryptedValue = bt.encrypt(element.value);
      element.removeAttribute('name');
      hiddenField = createElement('input', {
        value: encryptedValue,
        type: 'hidden',
        name: fieldName
      });
      form.appendChild(hiddenField);
    }
  };

  var onSubmitEncryptForm = function(form, callback) {
    var wrapped_callback;
    form = extractForm(form);

    wrapped_callback = function(e) {
      bt.encryptForm(form);
      return (callback == null) ? e : callback(e);
    };

    if (window.jQuery) {
      window.jQuery(form).submit(wrapped_callback);
    } else if (form.addEventListener) {
      form.addEventListener("submit", wrapped_callback, false);
    } else if (form.attachEvent) {
      form.attachEvent("onsubmit", wrapped_callback);
    }
  };

  // backwards compatibility
  var formEncrypter = {
    encryptForm: encryptForm,
    extractForm: extractForm,
    onSubmitEncryptForm: onSubmitEncryptForm
  };

  var bt = new function () {
    this.encrypt = encrypt;
    this.version = Braintree.version;
    this.publicKey = publicKey;
    this.encryptForm = encryptForm;
    this.formEncrypter = formEncrypter;
    this.onSubmitEncryptForm = onSubmitEncryptForm;
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
