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

  console.log('Handing off to embed/link logic')
  passToNextFunction(parsed.number, parsed.mode, parsed.buttonCopy, anchor, originalId)
}

function parseFormAssemblyId(fullId) {
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

function passToNextFunction(formIdNumber, mode, buttonCopy, anchorEl, originalId) {
  console.log('passToNextFunction called with number:', formIdNumber)
  console.log('passToNextFunction called with mode:', mode)

  if (buttonCopy != null) {
    console.log('passToNextFunction called with button copy:', buttonCopy)
  } else {
    console.log('passToNextFunction called with no button copy')
  }

  if (mode === 'linkOnly') {
    console.log('Mode is linkOnly — embed will not be attempted')
    return
  }

  console.log('Mode is', mode, '— attempting embed')

  ensureEmbedContainerExists(anchorEl, function (containerId) {
    console.log('Embed container confirmed in DOM:', '#' + containerId)
    injectPublishScriptAtEndOfBody(formIdNumber, containerId, originalId)
  })
}

/*
  Step 1: Create <div id="fa-form"></div> immediately after the anchor tag.
  Step 2: Confirm it exists, then proceed.
*/
function ensureEmbedContainerExists(anchorEl, onReady) {
  const containerId = 'fa-form'

  if (!anchorEl) {
    console.warn('ensureEmbedContainerExists: anchor element is missing')
    return
  }

  let container = document.getElementById(containerId)

  if (!container) {
    console.log('Creating embed container:', '<div id="' + containerId + '"></div>')
    const div = document.createElement('div')
    div.id = containerId
    anchorEl.insertAdjacentElement('afterend', div)
    container = div
  } else {
    console.log('Embed container already exists:', '#' + containerId)
  }

  // Confirm it exists in the DOM
  const confirmed = document.getElementById(containerId)
  if (!confirmed) {
    console.warn('Embed container was created but not found after insertion. Retrying...')
    setTimeout(function () {
      ensureEmbedContainerExists(anchorEl, onReady)
    }, 50)
    return
  }

  console.log('Embed container exists and is ready:', confirmed)
  if (typeof onReady === 'function') onReady(containerId)
}

/*
  Step 3: Add the publish script at the end of BODY.
*/
function injectPublishScriptAtEndOfBody(formIdNumber, targetId, originalId) {
  const body = document.body || document.getElementsByTagName('body')[0]

  if (!body) {
    console.warn('No BODY element found; cannot inject FormAssembly publish script')
    return
  }

  const src = 'https://sfmta.tfaforms.net/publish/' + formIdNumber

  // Avoid duplicate injection (same form + same target)
  const existing = document.querySelector(
    'script[data-fa-publish="true"][src="' + src + '"][data-qp-target-id="' + targetId + '"]'
  )

  if (existing) {
    console.log('Publish script already present, not injecting again:', src)
    return
  }

  // Confirm target exists before injecting
  const target = document.getElementById(targetId)
  if (!target) {
    console.warn('Target container #' + targetId + ' not found yet. Retrying inject...')
    setTimeout(function () {
      injectPublishScriptAtEndOfBody(formIdNumber, targetId, originalId)
    }, 100)
    return
  }

  console.log('Injecting FormAssembly publish script at end of BODY:', src)

  const s = document.createElement('script')
  s.setAttribute('data-fa-publish', 'true')
  s.setAttribute('src', src)
  s.setAttribute('data-qp-target-id', targetId)
  s.defer = true

  s.onload = function () {
    console.log('FormAssembly publish script loaded:', src)

    // If publish script attaches its work to DOMContentLoaded and we're already past it,
    // manually call the entry point if it exists.
    const domAlreadyReady = document.readyState !== 'loading'
    if (domAlreadyReady && typeof window.loadFormAssemblyFormHeadAndBodyContents === 'function') {
      console.log('DOMContentLoaded already fired; calling loadFormAssemblyFormHeadAndBodyContents() manually')
      try {
        window.loadFormAssemblyFormHeadAndBodyContents()
      } catch (e) {
        console.warn('Manual Quick Publish init failed:', e)
      }
    }
  }

  s.onerror = function () {
    console.error('FormAssembly publish script failed to load:', src)
  }

  body.appendChild(s)
}
