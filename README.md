# Braintree Client-Side Encryption

This library is for use with [Braintree's payment gateway](http://braintreepayments.com/) in concert with one of [the supported client libraries](http://braintreepayments.com/docs).  It encrypts sensitive payment information in a web browser using the public key of an asymmetric key pair.

## NOTICE: This Project is in Beta

While Client-Side Encryption is currently in use in production environments, you should be aware of the following if you are interested in using this technology during the beta period.

* This library is not yet a drop-in solution, so implementation will be more technically complicated than just using a Braintree client library.
* The public API of the library may change across releases.  We use [semantic versioning](http://semver.org/) to make it obvious when this happens.
* We may require you to upgrade to a new version of the library as we develop this technology.  (We'll contact you if this is the case; we won't deprecate an in-use version out from under you.)

## Getting Started

Here's a quick example.  First, include this library using a script tag:

```html
<head>
  <script src="/javascripts/braintree-1.1.0.min.js" type="text/javascript"></script>
</head>
```

You can download the JavaScript file from the [github downloads page](https://github.com/braintree/braintree_client_side_encryption/downloads).

Then, configure the library to use your public key.

```javascript
var braintree = Braintree.create("YOUR_CLIENT_SIDE_PUBLIC_ENCRYPTION_KEY");
```

And call the `encrypt` method passing in the data you wish to be encrypted.

```javascript
var encryptedValue = braintree.encrypt("sensitiveValue");
```

Because we are using asymmetric encryption, you will be unable to decrypt the data you have encrypted using your public encryption key. Only the Braintree Gateway will be able to decrypt these encrypted values.  This means that `encryptedValue` is now safe to pass through your servers to be used in the Server-to-Server API of one of our client libraries.

## Encrypting Form Values

The normal use case for this library is to encrypt a credit card number and CVV code before a form is submitted to your servers.  A simple example of this using [jQuery](http://jquery.com/) might look something like this:

```javascript
$('#transaction_form').submit(function () {
  $('#transaction_credit_card_number').val(braintree.encrypt($('#transaction_credit_card_number').val()));
  $('#transaction_credit_card_cvv').val(braintree.encrypt($('#transaction_credit_card_cvv').val()));
});
```
## Issues to Consider

Early releases of this library contain the core functionality of Client-Side Encryption, but there are a few issues that are left to your application to solve.

### User Experience on Form Submission

The simple example provided above will result in the encrypted values being momentarily visible in the browser before the form is submitted.  This is not ideal from a user interface standpoint.  One strategy to prevent this visual blip from happening is to make a hidden copy of the form to encrypt and submit, leaving the user's input visible in the original form.

### Maintain Security for Users without JavaScript

In a naive implementation, users without JavaScript enabled could end up submitting their credit cards to your server in the clear.  You'll need to take steps to ensure that a user can never enter their credit card without it being securely handled.  One way to achieve this is to have your form initially hidden and/or disabled, and use JavaScript to display and/or enable it. That way, users without JavaScript enabled will never see the form. You may want to add a noscript tag to inform your users that javascript is required.

## Retrieving your Encryption Key

When Client-Side encryption is enabled for your Braintree Gateway account, a key pair is generated and you are given a specially formatted version of the public key.

