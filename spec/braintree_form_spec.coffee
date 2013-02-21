describe "Braintree#form", ->
  afterEach ->
    window.jQuery = $

  beforeEach ->
    setFixtures "<form action='' id='braintree_form'>
                <input type='text' data-encrypted-name='credit-card-number' value='cc number'/>
                <input type='text' data-encrypted-name='credit-card-cvv' value='cvv' />
                <input type='text' name='card-holder-first-name' value='bob' />
                <input name='expiration-month' value ='May'/>
                <div id ='foo'>
                  <input data-encrypted-name ='credit-card-expiration-date' class='encrypted' value ='May'/>
                </div>
                <input type=\"submit\" id=\"click_me\" />
                </form>"
    @braintree = Braintree.create 'foo'
    @fakeEncrypter = (data) ->
      'encrypted ' + data

  describe "encryptForm", ->
    it "encrypts fields with data-encrypted-name attribute", ->
      spyOn(@braintree, 'encrypt').andCallFake @fakeEncrypter
      @braintree.formEncrypter.encryptForm document.getElementById('braintree_form')

      expect($('input[name="credit-card-number"]')).toHaveValue 'encrypted cc number'
      expect($('input[name="credit-card-cvv"]')).toHaveValue 'encrypted cvv'

    it "encrypts nested input fields", ->
      spyOn(@braintree, 'encrypt').andCallFake(@fakeEncrypter)
      @braintree.formEncrypter.encryptForm document.getElementById('braintree_form')

      expect($('input[name="credit-card-expiration-date"]')).toHaveValue 'encrypted May'

    it "does not encrypt fields without encrypted class", ->
      spyOn(@braintree, "encrypt").andCallFake @fakeEncrypter
      @braintree.formEncrypter.encryptForm document.getElementById("braintree_form")

      expect($('input[name="card-holder-first-name"]')).toHaveValue("bob")

  describe "extractForm", ->
    describe "returns the dom element", ->
      beforeEach ->
        @form = document.getElementById("braintree_form")

      it "when passed a dom element", ->
        expect(@braintree.formEncrypter.extractForm(@form)).toEqual(@form)

      it "when passed an element id", ->
        expect(@braintree.formEncrypter.extractForm(@form.id)).toEqual(@form)

      it "when passed a jQuery object", ->
        expect(@braintree.formEncrypter.extractForm($(@form))).toEqual(@form)

  describe "onSubmitEncryptForm", ->
    beforeEach ->
      spyOn(@braintree, 'encrypt').andCallFake @fakeEncrypter
      $("#braintree_form").submit((e) -> e.preventDefault()) #prevent the form from actually submitting

    describe "with jQuery", ->
      it "encrypts the form on form submit and calls a callback", ->
        window.called = false
        @braintree.onSubmitEncryptForm($("#braintree_form"), ->
          window.called = true
          expect($('input[type="hidden"][name="credit-card-cvv"]')).toExist()
          expect($('input[type="hidden"][name="credit-card-expiration-date"]')).toExist()
          expect($('input[type="hidden"][name="credit-card-number"]')).toExist()
        )
        $("#click_me").click()
        expect(window.called).toBeTruthy()

    describe "without jQuery", ->
      it "encrypts the form on form submit and calls a callback", ->
        window.called = false
        window.jQuery = undefined
        @braintree.onSubmitEncryptForm($("#braintree_form")[0], ->
          window.called = true
          window.jQuery = $
          expect($('input[type="hidden"][name="credit-card-cvv"]')).toExist()
          expect($('input[type="hidden"][name="credit-card-expiration-date"]')).toExist()
          expect($('input[type="hidden"][name="credit-card-number"]')).toExist()
        )
        $("#click_me").click()
        expect(window.called).toBeTruthy()
