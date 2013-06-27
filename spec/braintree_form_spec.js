describe("Braintree#form", function() {
  afterEach(function() {
    window.jQuery = $;
  });

  function setFormFixture() {
    setFixtures("<form action='' id='braintree_form'>" +
                "<input type='text' data-encrypted-name='credit-card-number' value='cc number'/>" +
                "<input type='text' data-encrypted-name='credit-card-cvv' value='cvv' />" +
                "<input type='text' name='card-holder-first-name' value='bob' />" +
                "<input name='expiration-month' value ='May'/>" +
                "<!-- example comment -->"+
                "<select data-encrypted-name='expiration-year'><option value='2013'>2013</option></select>" +
                "<div id ='foo'>" +
                "  <!-- example comment -->"+
                "  <input data-encrypted-name ='credit-card-expiration-date' class='encrypted' value ='May'/>" +
                "</div>" +
                "<input type=\"submit\" id=\"click_me\" />" +
                "</form>");

  }

  beforeEach(function() {
    setFormFixture();

    this.braintree = Braintree.create('foo');

    spyOn(this.braintree, 'encrypt').andCallFake(
      function (data) {
        return 'encrypted ' + data;
    });
  });

  describe("encryptForm", function() {
    it("can be called on the formEncrypter attribute of the braintree instance", function() {
      this.braintree.formEncrypter.encryptForm(document.getElementById('braintree_form'));
      expect($('input[type="hidden"][name="credit-card-cvv"]')).toExist();
    });

    it("works when passed an element", function() {
      this.braintree.encryptForm(document.getElementById('braintree_form'));
      expect($('input[type="hidden"][name="credit-card-cvv"]')).toExist();
    });

    it("works when passed a jQuery object", function() {
      this.braintree.encryptForm($('#braintree_form'));
      expect($('input[type="hidden"][name="credit-card-cvv"]')).toExist();
    });

    it("encrypts fields with data-encrypted-name attribute", function() {
      this.braintree.encryptForm('braintree_form');
      expect($('input[name="credit-card-number"]')).toHaveValue('encrypted cc number');
    });

    it("encrypts nested input fields", function() {
      this.braintree.encryptForm('braintree_form');
      expect($('input[name="credit-card-expiration-date"]')).toHaveValue('encrypted May');
    });

    it("encrypts <select> input fields", function() {
      this.braintree.encryptForm('braintree_form');
      expect($('input[name="expiration-year"]')).toHaveValue('encrypted 2013');
    });

    it("does not encrypt fields without encrypted class", function() {
      this.braintree.encryptForm('braintree_form');
      expect($('input[name="card-holder-first-name"]')).toHaveValue("bob");
    });

    it("removes existing hidden inputs previously injected", function() {
      this.braintree.encryptForm('braintree_form');
      this.braintree.encryptForm('braintree_form');
      expect($('input[type="hidden"][name="credit-card-cvv"]').length).toBe(1);
      expect($('input[type="hidden"][name="credit-card-expiration-date"]').length).toBe(1);
      expect($('input[type="hidden"][name="credit-card-number"]').length).toBe(1);
    });

    it("shouldn't throw DOM exceptions when attempting to remove hidden inputs that no longer exist in the document", function() {
      this.braintree.encryptForm('braintree_form');
      setFormFixture();
      this.braintree.encryptForm('braintree_form');
    });

    it("shouldn't throw DOM exceptions when encrypting multiple times", function() {
      this.braintree.encryptForm('braintree_form');
      this.braintree.encryptForm('braintree_form');
      this.braintree.encryptForm('braintree_form');
    });
  });

  describe("onSubmitEncryptForm", function() {
    beforeEach(function() {
      $("#braintree_form").submit(function(e) {
        e.preventDefault();
      });
    });

    it("can be called on the formEncrypter attribute of the braintree instance", function() {
      this.braintree.formEncrypter.onSubmitEncryptForm('braintree_form');
      $("#click_me").click();
      expect($('input[type="hidden"][name="credit-card-cvv"]')).toExist();
    });

    it("works when passed an element id", function() {
      this.braintree.onSubmitEncryptForm('braintree_form');
      $("#click_me").click();
      expect($('input[type="hidden"][name="credit-card-cvv"]')).toExist();
    });

    it("has correct ordering with jQuery", function() {
      window.called = false;
      this.braintree.onSubmitEncryptForm($("#braintree_form"), function() {
        window.called = true;
        expect($('input[type="hidden"][name="credit-card-cvv"]')).toExist();
        expect($('input[type="hidden"][name="credit-card-expiration-date"]')).toExist();
        expect($('input[type="hidden"][name="credit-card-number"]')).toExist();
      });
      $("#click_me").click();
      expect(window.called).toBeTruthy();
    });

    it("has correct ordering without jQuery", function() {
      window.called = false;
      window.jQuery = void 0;
      this.braintree.onSubmitEncryptForm($("#braintree_form")[0], function() {
        window.called = true;
        window.jQuery = $;
        expect($('input[type="hidden"][name="credit-card-cvv"]')).toExist();
        expect($('input[type="hidden"][name="credit-card-expiration-date"]')).toExist();
        expect($('input[type="hidden"][name="credit-card-number"]')).toExist();
      });
      $("#click_me").click();
      expect(window.called).toBeTruthy();
    });
  });
});
