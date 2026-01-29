/*
  FormAssembly dynamic handler
  Loaded via:
  <script src="//sfmta-digital-comms.github.io/gnah/form-assembly.js"></script>
*/

setTimeout(function () {
  console.log('500ms delay complete, starting FormAssembly script')
  findFormAssemblyAnchor()
}, 500)

function findFormAssemblyAnchor() {
  console.log('Searching for A tag with ID starting with FormAssemblyForm')

  const anchor = document.querySelector('a[id^="FormAssemblyForm"]')

  if (!anchor) {
    console.warn('No A tag found with ID starting with FormAssemblyForm')
    return
  }

  const originalId = anchor.getAttribute('id')
  console.log('Matching A tag found:', anchor)
  console.log('Full ID value:', originalId)

  const parsed = parseFormAssemblyId(originalId)

  if (!parsed) {
    console.warn('Found a FormAssemblyForm anchor, but ID did not match expected patterns:', originalId)
    return
  }

  console.log('Extracted number:', parsed.number)
  console.log('Detected mode:', parsed.mode)
  console.log('Detected button copy:', parsed.buttonCopy)

  // Always create the fallback button (even for embedOnly)
  const buttonHtml = buildButtonHtml({
    originalId: originalId,
    formNumber: parsed.number,
    buttonCopy: parsed.buttonCopy
  })

  insertHtmlAfterElement(anchor, buttonHtml)

  console.log('Handing off to embed pipeline')
  passToNextFunction(parsed.number, parsed.mode, parsed.buttonCopy)
}

function parseFormAssemblyId(fullId) {
  // Supported patterns:
  // FormAssemblyForm312
  // FormAssemblyForm312-linkOnly
  // FormAssemblyForm312-embedOnly
  // FormAssemblyForm312-Apply
  // FormAssemblyForm312-linkOnly-Submit
  // FormAssemblyForm312-Submit-linkOnly

  const baseMatch = fullId.match(/^FormAssemblyForm(\d+)(.*)$/)

  if (!baseMatch) {
    return null
  }

  const number = baseMatch[1]
  const suffix = baseMatch[2] || ''

  if (!suffix) {
    return { number: number, mode: 'standard', buttonCopy: null }
  }

  const raw = suffix.replace(/^-/, '')
  const tokens = raw ? raw.split('-').filter(Boolean) : []

  const modeTokens = new Set(['linkOnly', 'embedOnly'])
  let mode = 'standard'

  for (const token of tokens) {
    if (modeTokens.has(token)) {
      mode = token
      break
    }
  }

  const copyCandidates = tokens.filter(function (t) {
    return !modeTokens.has(t)
  })

  const buttonCopy = copyCandidates.length ? copyCandidates[0] : null

  // embedOnly never uses button copy
  if (mode === 'embedOnly') {
    return { number: number, mode: mode, buttonCopy: null }
  }

  return { number: number, mode: mode, buttonCopy: buttonCopy }
}

function buildButtonHtml(options) {
  const originalId = options.originalId
  const generatedId = 'Gen-' + originalId
  const formNumber = options.formNumber
  const rawCopy = options.buttonCopy

  const buttonCopy = rawCopy ? rawCopy : 'Continue'
  const buttonText = buttonCopy + ' Online'

  const href = 'https://sfmta.tfaforms.net/' + formNumber
  const nameAttr = 'Continue to ' + buttonCopy + ' online'

  return (
    '<p style="margin-top: 20px;">' +
      '<a id="' + escapeHtmlAttribute(generatedId) + '" ' +
        'class="btn btn-danger btn-lg text-decoration-underline" ' +
        'style="font-size: 22px; color:white; padding:17px 20px; text-decoration: underline!important; text-decoration-thickness: 3px !important;" ' +
        'href="' + escapeHtmlAttribute(href) + '" ' +
        'name="' + escapeHtmlAttribute(nameAttr) + '" ' +
        'target="_blank">' +
        escapeHtmlText(buttonText) +
      '</a>' +
    '</p>'
  )
}

function insertHtmlAfterElement(element, html) {
  element.insertAdjacentHTML('afterend', html)
}

function escapeHtmlAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function passToNextFunction(formIdNumber, mode, buttonCopy) {
  console.log('passToNextFunction called with number:', formIdNumber)
  console.log('passToNextFunction called with mode:', mode)

  if (typeof buttonCopy !== 'undefined') {
    console.log('passToNextFunction called with button copy:', buttonCopy)
  } else {
    console.log('passToNextFunction called with no button copy')
  }

  // linkOnly never attempts embed or head injection
  if (mode === 'linkOnly') {
    console.log('Mode is linkOnly — skipping HEAD assets and embed')
    return
  }

  console.log('Ensuring FormAssembly HEAD assets are present')

  ensureFormAssemblyHeadAssets(function () {
    console.log('HEAD assets ready — embed logic will go here next')
    // attemptEmbed(formIdNumber, mode, buttonCopy)
  })
}

function ensureFormAssemblyHeadAssets(done) {
  // Prevent double-injection across multiple calls
  if (window.__faHeadAssetsReady === true) {
    if (typeof done === 'function') done()
    return
  }

  // If an injection is already in progress, queue callbacks
  if (window.__faHeadAssetsLoading === true) {
    window.__faHeadAssetsCallbacks = window.__faHeadAssetsCallbacks || []
    if (typeof done === 'function') window.__faHeadAssetsCallbacks.push(done)
    return
  }

  window.__faHeadAssetsLoading = true
  window.__faHeadAssetsCallbacks = window.__faHeadAssetsCallbacks || []
  if (typeof done === 'function') window.__faHeadAssetsCallbacks.push(done)

  const head = document.head || document.getElementsByTagName('head')[0]
  if (!head) {
    console.warn('No HEAD element found; cannot inject FormAssembly head assets')
    finishHeadAssets()
    return
  }

  const finishHeadAssetsOnce = function () {
    if (window.__faHeadAssetsReady === true) return
    window.__faHeadAssetsReady = true
    window.__faHeadAssetsLoading = false

    const callbacks = window.__faHeadAssetsCallbacks || []
    window.__faHeadAssetsCallbacks = []

    callbacks.forEach(function (cb) {
      try {
        cb()
      } catch (e) {
        console.error(e)
      }
    })
  }

  const addMetaOnce = function (selector, buildMeta) {
    if (head.querySelector(selector)) return
    const el = buildMeta()
    head.appendChild(el)
  }

  const addStyleOnce = function (id, cssText) {
    if (head.querySelector('#' + id)) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = cssText
    head.appendChild(style)
  }

  const addLinkOnce = function (href, rel, type, title) {
    if (!href) return
    const selector = 'link[rel="' + rel + '"][href="' + href + '"]'
    if (head.querySelector(selector)) return
    const link = document.createElement('link')
    link.setAttribute('href', href)
    link.setAttribute('rel', rel)
    if (type) link.setAttribute('type', type)
    if (title) link.setAttribute('title', title)
    head.appendChild(link)
  }

  const addInlineScriptOnce = function (id, scriptText) {
    if (head.querySelector('#' + id)) return
    const s = document.createElement('script')
    s.id = id
    s.type = 'text/javascript'
    s.text = scriptText
    head.appendChild(s)
  }

  const loadScriptOnce = function (src, attrs) {
    if (!src) return Promise.resolve()
    if (head.querySelector('script[src="' + src + '"]')) return Promise.resolve()

    return new Promise(function (resolve, reject) {
      const s = document.createElement('script')
      s.type = 'text/javascript'
      s.src = src

      if (attrs && attrs.defer) s.defer = true
      if (attrs && attrs.async) s.async = true

      s.onload = function () { resolve() }
      s.onerror = function () { reject(new Error('Failed to load ' + src)) }

      head.appendChild(s)
    })
  }

  // ---------- HEAD INJECTION (your current approach), kept intact ----------
  addMetaOnce('meta[http-equiv="Content-Type"]', function () {
    const m = document.createElement('meta')
    m.setAttribute('http-equiv', 'Content-Type')
    m.setAttribute('content', 'text/html; charset=utf-8')
    return m
  })

  addMetaOnce('meta[name="referrer"]', function () {
    const m = document.createElement('meta')
    m.setAttribute('name', 'referrer')
    m.setAttribute('content', 'no-referrer-when-downgrade')
    return m
  })

  const faDomDispatcherSrc = 'https://sfmta.tfaforms.net/js/FA__DOMContentLoadedEventDispatcher.js'
  if (!head.querySelector('script[data-for="FA__DOMContentLoadedEventDispatch"][src="' + faDomDispatcherSrc + '"]')) {
    const faDomDispatcherScript = document.createElement('script')
    faDomDispatcherScript.setAttribute('type', 'text/javascript')
    faDomDispatcherScript.setAttribute('data-for', 'FA__DOMContentLoadedEventDispatch')
    faDomDispatcherScript.setAttribute('src', faDomDispatcherSrc)
    faDomDispatcherScript.defer = true
    head.appendChild(faDomDispatcherScript)
  }

  addStyleOnce(
    'fa-captcha-css',
    '.captcha {\n' +
      '  padding-bottom: 1em !important;\n' +
    '}\n' +
    '.wForm .captcha .oneField {\n' +
      '  margin: 0;\n' +
      '  padding: 0;\n' +
    '}\n'
  )

  // Vendor / FA inline bootstrap (kept as provided; contains "var" intentionally)
  addInlineScriptOnce(
    'fa-captcha-bootstrap',
    '                    // initialize our variables\n' +
    '                    var captchaReady = 0;\n' +
    '                    var wFORMSReady = 0;\n' +
    '                    var isConditionalSubmitEnabled = false;\n' +
    '\n' +
    '                    // when wForms is loaded call this\n' +
    '                    var wformsReadyCallback = function () {\n' +
    '                        // using this var to denote if wForms is loaded\n' +
    '                        wFORMSReady = 1;\n' +
    "                        isConditionalSubmitEnabled = document.getElementById('submit_button').hasAttribute('data-condition');\n" +
    '                        // call our recaptcha function which is dependent on both\n' +
    '                        // wForms and an async call to google\n' +
    '                        // note the meat of this function wont fire until both\n' +
    '                        // wFORMSReady = 1 and captchaReady = 1\n' +
    '                        onloadCallback();\n' +
    '                    }\n' +
    '                    var gCaptchaReadyCallback = function() {\n' +
    '                        // using this var to denote if captcha is loaded\n' +
    '                        captchaReady = 1;\n' +
    "                        isConditionalSubmitEnabled = document.getElementById('submit_button').hasAttribute('data-condition');\n" +
    '                        // call our recaptcha function which is dependent on both\n' +
    '                        // wForms and an async call to google\n' +
    '                        // note the meat of this function wont fire until both\n' +
    '                        // wFORMSReady = 1 and captchaReady = 1\n' +
    '                        onloadCallback();\n' +
    '                    };\n' +
    '\n' +
    '                    // add event listener to fire when wForms is fully loaded\n' +
    '                    document.addEventListener("wFORMSLoaded", wformsReadyCallback);\n' +
    '\n' +
    '                    var enableSubmitButton = function() {\n' +
    "                        var submitButton = document.getElementById('submit_button');\n" +
    "                        var explanation = document.getElementById('disabled-explanation');\n" +
    '                        var isConditionalSubmitConditionMet = wFORMS.behaviors.condition.isConditionalSubmitConditionMet;\n' +
    '                        if (\n' +
    '                            submitButton != null &&\n' +
    '                            (isConditionalSubmitEnabled && isConditionalSubmitConditionMet) ||\n' +
    '                            !isConditionalSubmitEnabled\n' +
    '                        )\n' +
    '                        {\n' +
    "                            submitButton.removeAttribute('disabled');\n" +
    '                            if (explanation != null) {\n' +
    "                                explanation.style.display = 'none';\n" +
    '                            }\n' +
    '                        }\n' +
    '                    };\n' +
    '                    var disableSubmitButton = function() {\n' +
    "                        var submitButton = document.getElementById('submit_button');\n" +
    "                        var explanation = document.getElementById('disabled-explanation');\n" +
    '                        if (submitButton != null) {\n' +
    '                            submitButton.disabled = true;\n' +
    '                            if (explanation != null) {\n' +
    "                                explanation.style.display = 'block';\n" +
    '                            }\n' +
    '                        }\n' +
    '                    };\n' +
    '\n' +
    '                    // call this on both captcha async complete and wforms fully\n' +
    "                    // initialized since we can't be sure which will complete first\n" +
    '                    // and we need both done for this to function just check that they are\n' +
    '                    // done to fire the functionality\n' +
    '                    var onloadCallback = function () {\n' +
    '                        // if our captcha is ready (async call completed)\n' +
    '                        // and wFORMS is completely loaded then we are ready to add\n' +
    '                        // the captcha to the page\n' +
    '                        if (captchaReady && wFORMSReady) {\n' +
    '                            // Prevent both concurrent and sequential executions\n' +
    '                            if (window.isCreatingCaptcha || window.hasCaptchaRendered) {\n' +
    '                                return;\n' +
    '                            }\n' +
    '                            window.isCreatingCaptcha = true;\n' +
    '\n' +
    '                            try {\n' +
    "                                var submitButton = document.getElementById('submit_button');\n" +
    "                                var formContainer = submitButton.closest('form') || submitButton.closest('.wFormContainer');\n" +
    '                                var faCaptcha = null;\n' +
    '\n' +
    '                                if (formContainer) {\n' +
    "                                    faCaptcha = formContainer.querySelector('#google-captcha');\n" +
    '                                }\n' +
    '\n' +
    '                                // Also check if captcha was appended to body as fallback (look for FA-specific structure)\n' +
    '                                if (!faCaptcha) {\n' +
    "                                    var bodyCaptchas = document.querySelectorAll('body > #google-captcha');\n" +
    '                                    for (var i = 0; i < bodyCaptchas.length; i++) {\n' +
    '                                        // Verify it is a FormAssembly captcha by checking for specific structure\n' +
    "                                        if (bodyCaptchas[i].querySelector('.captcha .oneField .g-recaptcha')) {\n" +
    '                                            faCaptcha = bodyCaptchas[i];\n' +
    '                                            break;\n' +
    '                                        }\n' +
    '                                    }\n' +
    '                                }\n' +
    '\n' +
    '                                if (faCaptcha) {\n' +
    '                                    if (faCaptcha.parentNode) {\n' +
    '                                        faCaptcha.parentNode.removeChild(faCaptcha);\n' +
    '                                    }\n' +
    '                                }\n' +
    '\n' +
    '                            // Now create a new captcha container\n' +
    "                            var captchaContainer = document.createElement('div');\n" +
    "                            captchaContainer.id = 'google-captcha';\n" +
    '\n' +
    "                            var captchaDiv = document.createElement('div');\n" +
    "                            captchaDiv.className = 'captcha';\n" +
    '\n' +
    "                            var oneFieldDiv = document.createElement('div');\n" +
    "                            oneFieldDiv.className = 'oneField';\n" +
    '\n' +
    "                            var recaptchaElement = document.createElement('div');\n" +
    "                            recaptchaElement.id = 'g-recaptcha-render-div';\n" +
    "                            recaptchaElement.className = 'g-recaptcha';\n" +
    '\n' +
    "                            var errorDiv = document.createElement('div');\n" +
    "                            errorDiv.className = 'g-captcha-error';\n" +
    '\n' +
    "                            var helpDiv = document.createElement('div');\n" +
    "                            helpDiv.className = 'captchaHelp';\n" +
    "                            helpDiv.innerHTML = 'reCAPTCHA helps prevent automated form spam.<br>';\n" +
    '\n' +
    "                            var disabledDiv = document.createElement('div');\n" +
    "                            disabledDiv.id = 'disabled-explanation';\n" +
    "                            disabledDiv.className = 'captchaHelp';\n" +
    "                            disabledDiv.style.display = 'block';\n" +
    "                            disabledDiv.innerHTML = 'The submit button will be disabled until you complete the CAPTCHA.';\n" +
    '\n' +
    '                            oneFieldDiv.appendChild(recaptchaElement);\n' +
    '                            oneFieldDiv.appendChild(errorDiv);\n' +
    '                            oneFieldDiv.appendChild(document.createElement("br"));\n' +
    '                            captchaDiv.appendChild(oneFieldDiv);\n' +
    '                            captchaDiv.appendChild(helpDiv);\n' +
    '                            captchaDiv.appendChild(disabledDiv);\n' +
    '                            captchaContainer.appendChild(document.createElement("br"));\n' +
    '                            captchaContainer.appendChild(captchaDiv);\n' +
    '\n' +
    '                            if (submitButton && submitButton.parentNode) {\n' +
    '                                submitButton.parentNode.insertBefore(captchaContainer, submitButton);\n' +
    '                            } else {\n' +
    '                                // Fallback: append to body if submit button not found.\n' +
    '                                document.body.appendChild(captchaContainer);\n' +
    '                            }\n' +
    '                        } finally {\n' +
    '                            window.isCreatingCaptcha = false;\n' +
    '                        }\n' +
    '\n' +
    "                            grecaptcha.enterprise.render('g-recaptcha-render-div', {\n" +
    "                                'sitekey': '6LfMg_EaAAAAAMhDNLMlgqDChzmtYHlx1yU2y7GI',\n" +
    "                                'theme': 'light',\n" +
    "                                'size': 'normal',\n" +
    "                                'callback': 'enableSubmitButton',\n" +
    "                                'expired-callback': 'disableSubmitButton'\n" +
    '                            });\n' +
    '                            window.hasCaptchaRendered = true;\n' +
    "                            var oldRecaptchaCheck = parseInt('1');\n" +
    '                            if (oldRecaptchaCheck === -1) {\n' +
    '                                var standardCaptcha = document.getElementById("tfa_captcha_text");\n' +
    '                                standardCaptcha = standardCaptcha.parentNode.parentNode.parentNode;\n' +
    '                                standardCaptcha.parentNode.removeChild(standardCaptcha);\n' +
    '                            }\n' +
    '\n' +
    "                            if (!wFORMS.instances['paging']) {\n" +
    '                                document.getElementById("g-recaptcha-render-div").parentNode.parentNode.parentNode.style.display = "block";\n' +
    '                            }\n' +
    '                            document.getElementById("g-recaptcha-render-div").getAttributeNode("id").value = "tfa_captcha_text";\n' +
    '\n' +
    "                            var captchaError = '';\n" +
    "                            if (captchaError == '1') {\n" +
    "                                var errMsgText = 'The CAPTCHA was not completed successfully.';\n" +
    '                                var errMsgDiv = document.createElement("div");\n' +
    '                                errMsgDiv.id = "tfa_captcha_text-E";\n' +
    '                                errMsgDiv.className = "err errMsg";\n' +
    '                                errMsgDiv.innerText = errMsgText;\n' +
    '                                var loc = document.querySelector(".g-captcha-error");\n' +
    '                                loc.insertBefore(errMsgDiv, loc.childNodes[0]);\n' +
    '\n' +
    '                                /* See wFORMS.behaviors.paging.applyTo for origin of this code */\n' +
    "                                if (wFORMS.instances['paging']) {\n" +
    "                                    var b = wFORMS.instances['paging'][0];\n" +
    '                                    var pp = base2.DOM.Element.querySelector(document, wFORMS.behaviors.paging.CAPTCHA_ERROR);\n' +
    '                                    if (pp) {\n' +
    '                                        var lastPage = 1;\n' +
    '                                        for (var i = 1; i < 100; i++) {\n' +
    '                                            if (b.behavior.isLastPageIndex(i)) {\n' +
    '                                                lastPage = i;\n' +
    '                                                break;\n' +
    '                                            }\n' +
    '                                        }\n' +
    '                                        b.jumpTo(lastPage);\n' +
    '                                    }\n' +
    '                                }\n' +
    '                            }\n' +
    '                        }\n' +
    '                    }\n'
  )

  const recaptchaEnterpriseSrc =
    'https://www.google.com/recaptcha/enterprise.js?onload=gCaptchaReadyCallback&render=explicit&hl=en_US'
  loadScriptOnce(recaptchaEnterpriseSrc, { async: true, defer: true }).catch(function (err) {
    console.error(err)
  })

  addInlineScriptOnce(
    'fa-captcha-domcontentloaded',
    'document.addEventListener("DOMContentLoaded", function() {\n' +
    '  var warning = document.getElementById("javascript-warning");\n' +
    '  if (warning != null) {\n' +
    '    warning.parentNode.removeChild(warning);\n' +
    '  }\n' +
    "  var oldRecaptchaCheck = parseInt('1');\n" +
    '  if (oldRecaptchaCheck !== -1) {\n' +
    "    var explanation = document.getElementById('disabled-explanation');\n" +
    "    var submitButton = document.getElementById('submit_button');\n" +
    '    if (submitButton != null) {\n' +
    '      submitButton.disabled = true;\n' +
    '      if (explanation != null) {\n' +
    "        explanation.style.display = 'block';\n" +
    '      }\n' +
    '    }\n' +
    '  }\n' +
    '});\n'
  )

  addInlineScriptOnce(
    'fa-elapsed-js-time',
    'document.addEventListener("FA__DOMContentLoaded", function () {\n' +
    '  const FORM_TIME_START = Math.floor((new Date).getTime() / 1000);\n' +
    '  let formElement = document.getElementById("tfa_0");\n' +
    '  if (null === formElement) {\n' +
    '    formElement = document.getElementById("0");\n' +
    '  }\n' +
    '  let appendJsTimerElement = function () {\n' +
    '    let formTimeDiff = Math.floor((new Date).getTime() / 1000) - FORM_TIME_START;\n' +
    '    let cumulatedTimeElement = document.getElementById("tfa_dbCumulatedTime");\n' +
    '    if (null !== cumulatedTimeElement) {\n' +
    '      let cumulatedTime = parseInt(cumulatedTimeElement.value);\n' +
    '      if (null !== cumulatedTime && cumulatedTime > 0) {\n' +
    '        formTimeDiff += cumulatedTime;\n' +
    '      }\n' +
    '    }\n' +
    '    let jsTimeInput = document.createElement("input");\n' +
    '    jsTimeInput.setAttribute("type", "hidden");\n' +
    '    jsTimeInput.setAttribute("value", formTimeDiff.toString());\n' +
    '    jsTimeInput.setAttribute("name", "tfa_dbElapsedJsTime");\n' +
    '    jsTimeInput.setAttribute("id", "tfa_dbElapsedJsTime");\n' +
    '    jsTimeInput.setAttribute("autocomplete", "off");\n' +
    '    if (null !== formElement) {\n' +
    '      formElement.appendChild(jsTimeInput);\n' +
    '    }\n' +
    '  };\n' +
    '  if (null !== formElement) {\n' +
    '    if (formElement.addEventListener) {\n' +
    "      formElement.addEventListener('submit', appendJsTimerElement, false);\n" +
    '    } else if (formElement.attachEvent) {\n' +
    "      formElement.attachEvent('onsubmit', appendJsTimerElement);\n" +
    '    }\n' +
    '  }\n' +
    '});\n'
  )

  addLinkOnce(
    'https://sfmta.tfaforms.net/dist/form-builder/5.0.0/wforms-layout.css?v=4395b64e0646440f2dd543976e0c51ad034a9187',
    'stylesheet',
    'text/css'
  )

  addLinkOnce(
    'https://sfmta.tfaforms.net/uploads/themes/theme-81.css',
    'stylesheet',
    'text/css'
  )

  addLinkOnce(
    'https://sfmta.tfaforms.net/dist/form-builder/5.0.0/wforms-jsonly.css?v=4395b64e0646440f2dd543976e0c51ad034a9187',
    'alternate stylesheet',
    'text/css',
    'This stylesheet activated by javascript'
  )

  addLinkOnce(
    'https://sfmta.tfaforms.net/css/kalendae.css',
    'stylesheet',
    'text/css'
  )

  addLinkOnce(
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css',
    'stylesheet',
    'text/css'
  )

  const wformsSrc =
    'https://sfmta.tfaforms.net/wForms/3.11/js/wforms.js?v=4395b64e0646440f2dd543976e0c51ad034a9187'
  const kalendaeSrc =
    'https://sfmta.tfaforms.net/js/kalendae/kalendae.standalone.min.js'
  const wformsCalendarSrc =
    'https://sfmta.tfaforms.net/wForms/3.11/js/wforms_calendar.js'
  const wformsLocalizationSrc =
    'https://sfmta.tfaforms.net/wForms/3.11/js/localization-en_US.js?v=4395b64e0646440f2dd543976e0c51ad034a9187'

  const jquerySrc =
    'https://sfmta.tfaforms.net/dist/jquery/jquery.0416573c648d279fd758.js'
  const typeaheadSrc =
    'https://sfmta.tfaforms.net/js/typeahead/v1.2.0/typeahead.bundle.js'

  loadScriptOnce(wformsSrc)
    .then(function () {
      addInlineScriptOnce(
        'fa-wforms-prefill-skip',
        "if (typeof wFORMS !== 'undefined' && wFORMS.behaviors && wFORMS.behaviors.prefill) { wFORMS.behaviors.prefill.skip = false; }"
      )
    })
    .then(function () { return loadScriptOnce(kalendaeSrc) })
    .then(function () { return loadScriptOnce(wformsCalendarSrc) })
    .then(function () { return loadScriptOnce(wformsLocalizationSrc) })
    .then(function () {
      // Optional: mirror FA noConflict behavior (vendor snippet uses var intentionally)
      addInlineScriptOnce(
        'fa-oldjq-snapshot',
        'var FAoldJQ;\n' +
        'if (typeof $ != "undefined" && $.noConflict) FAoldJQ = $.noConflict(true);\n'
      )
      return loadScriptOnce(jquerySrc)
    })
    .then(function () { return loadScriptOnce(typeaheadSrc) })
    .then(function () {
      addInlineScriptOnce(
        'fa-jq-noconflict',
        'var FA$ = $.noConflict(true);\n' +
        'if (FAoldJQ) $ = FAoldJQ;\n'
      )

      // Mark ready after our chain completes
      finishHeadAssetsOnce()
    })
    .catch(function (err) {
      console.error(err)
      // Even if something fails, we still mark ready so the page can fall back to the button
      finishHeadAssetsOnce()
    })

  function finishHeadAssets() {
    finishHeadAssetsOnce()
  }
}
