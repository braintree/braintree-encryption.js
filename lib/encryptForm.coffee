class BraintreeFormEncrypter
  constructor: (@bt) ->

  create: (tagName, attrs={}) ->
    element = document.createElement(tagName)
    for k,v of attrs
      element.setAttribute(k,v)
    element

  inputElements: (form) ->
    inputs = []
    inputChildren = (elem) ->
      for e in elem.children
        if e.attributes['data-encrypted-name']
          inputs.push e
        else
          inputChildren e
    inputChildren(form)
    inputs

  encryptForm: (form) =>
    for element in @inputElements(form)
      fieldName = element.getAttribute('data-encrypted-name')
      encryptedValue = @bt.encrypt(element.value)
      element.removeAttribute('name')
      hiddenField = @create('input',
        value: encryptedValue,
        type: 'hidden',
        name: fieldName
      )
      form.appendChild(hiddenField)

  extractForm: (object) ->
    if window.jQuery and object instanceof jQuery
      object[0]
    else if object instanceof Object
      object
    else
      document.getElementById(object)

  onSubmitEncryptForm: (form, callback = (e) => e) =>
    form = @extractForm(form)
    wrapped_callback = (e) =>
      @encryptForm(form)
      callback(e)
    if window.jQuery
      window.jQuery(form).submit(wrapped_callback)
    else if form.addEventListener
      form.addEventListener("submit", wrapped_callback, false)
    else if form.attachEvent
      form.attachEvent("onsubmit", wrapped_callback)

Braintree.FormEncrypter = BraintreeFormEncrypter
