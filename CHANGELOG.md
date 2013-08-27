== 1.3.6

* Fix global variable creation

== 1.3.5

* Fix issue when removing hidden form elements that no longer exist on the page

== 1.3.4

* Fix issue in IE 8 and below or IE 9 in quirksmode where comment nodes were incorrectly being handled

== 1.3.3

* Fix encryptForm so it can be called any number of times, as before 1.3.1

== 1.3.2

* Fix problem with select elements introduced in 1.3.1

== 1.3.1

* Refactor for consistency / readability
* Don't add hidden form elements multiple times if encryptForm is called more than once

== 1.3.0

* Add AMD Support
* Improved error messages when wrong key is used
* Update encryptForm to take a jQuery object or element id
* Fix calling form encryption helpers with DOM elements in IE < 10

== 1.2.0

* Add form encryption helpers

== 1.1.1

* Removed trailing comma that broke IE and Closure compiler (GitHub issues #1 and #2)

== 1.1.0

* Initial release
