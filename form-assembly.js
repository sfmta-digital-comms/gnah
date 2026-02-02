/*
  FormAssembly dynamic handler
  Loaded via:
  <script src="//sfmta-digital-comms.github.io/gnah/form-assembly.js"></script>
*/

setTimeout(() => {
  console.log('500ms delay complete, starting FormAssembly script')
  findFormAssemblyAnchor()
}, 500)

function findFormAssemblyAnchor() {
  console.log('Searching for A tag with ID starting with FormAssemblyForm')

  const anchors = Array.from(document.querySelectorAll('a[id^="FormAssemblyForm"]'))

  if (!anchors.length) {
    console.warn('No A tag found with ID starting with FormAssemblyForm')
    return
  }

  console.log('Matching A tags found:', anchors.length)

  for (const anchor of anchors) {
    const originalId = anchor.getAttribute('id')
    console.log('Matching A tag found:', anchor)
    console.log('Full ID value:', originalId)

    const parsed = parseFormAssemblyId(originalId)

    if (!parsed) {
      console.warn(
        'Found a FormAssemblyForm anchor, but ID did not match expected patterns:',
        originalId
      )
      continue
    }

    console.log('Extracted number:', parsed.number)
    console.log('Detected mode:', parsed.mode)
    console.log('Detected button copy:', parsed.buttonCopy)

    passToNextFunction(parsed.number, parsed.mode, parsed.buttonCopy, anchor, originalId)
  }
}

function makeEmbedContainerId(originalId) {
  const safe = String(originalId).replace(/[^A-Za-z0-9_\-:.]/g, '_')
  return 'fa-form-' + safe
}

function parseFormAssemblyId(fullId) {
  const baseMatch = fullId.match(/^FormAssemblyForm(\d+)(.*)$/)
  if (!baseMatch) return null

  const number = baseMatch[1]
  const suffix = baseMatch[2] || ''

  if (!suffix) {
    return { number, mode: 'standard', buttonCopy: null }
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

  const copyCandidates = tokens.filter(t => !modeTokens.has(t))
  const buttonCopy = copyCandidates.length ? copyCandidates[0] : null

  if (mode === 'embedOnly') {
    return { number, mode, buttonCopy: null }
  }

  return { number, mode, buttonCopy }
}

function passToNextFunction(formIdNumber, mode, buttonCopy, anchorEl, originalId) {
  console.log('passToNextFunction called with number:', formIdNumber)
  console.log('passToNextFunction called with mode:', mode)

  if (buttonCopy != null) {
    console.log('passToNextFunction called with button copy:', buttonCopy)
  } else {
    console.log('passToNextFunction called with no button copy')
  }

  const shouldLinkOnly = mode === 'linkOnly'
  const shouldEmbed = mode === 'standard' || mode === 'embedOnly'
  const allowFallbackToButton = mode === 'standard' || mode === 'embedOnly'
  // ^ change embedOnly to false here if you NEVER want fallback for embedOnly

  if (shouldLinkOnly) {
    console.log('Rendering LINK ONLY')
    renderButtonOnly(anchorEl, originalId, formIdNumber, buttonCopy)
    return
  }

  if (shouldEmbed) {
    console.log('Rendering EMBED (fallback allowed:', allowFallbackToButton, ')')
    renderEmbedWithFallback(anchorEl, originalId, formIdNumber, buttonCopy, allowFallbackToButton)
    return
  }

  console.warn('Unknown mode; defaulting to LINK ONLY')
  renderButtonOnly(anchorEl, originalId, formIdNumber, buttonCopy)
}

/* ===========================
   Rendering helpers
=========================== */

function renderButtonOnly(anchorEl, originalId, formNumber, buttonCopy) {
  const containerId = makeEmbedContainerId(originalId)
  removeEmbedContainer(containerId)
  removePublishScript(formNumber, containerId)
  removeGeneratedButton(originalId)

  const buttonHtml = buildButtonHtml({
    originalId,
    formNumber,
    buttonCopy
  })

  insertHtmlAfterElement(anchorEl, buttonHtml)
}

function renderEmbedWithFallback(anchorEl, originalId, formNumber, buttonCopy, allowFallback) {
  removeGeneratedButton(originalId)

  ensureEmbedContainerExists(anchorEl, originalId, containerId => {
    console.log('Embed container confirmed:', containerId)

    injectPublishScriptAtEndOfBody(formNumber, containerId, result => {
      if (result?.ok) {
        validateEmbedRendered(containerId, renderedOk => {
          if (renderedOk) {
            console.log('Embed rendered successfully')
            return
          }

          console.warn('Embed did not render in time')
          if (allowFallback) {
            renderButtonOnly(anchorEl, originalId, formNumber, buttonCopy)
          }
        })
        return
      }

      console.warn('Publish script failed')
      if (allowFallback) {
        renderButtonOnly(anchorEl, originalId, formNumber, buttonCopy)
      }
    })
  })
}

/* ===========================
   Button utilities
=========================== */

function buildButtonHtml({ originalId, formNumber, buttonCopy }) {
  const generatedId = 'Gen-' + originalId
  const finalCopy = buttonCopy || 'Continue'
  const buttonText = finalCopy + ' Online'
  const href = 'https://sfmta.tfaforms.net/' + formNumber
  const nameAttr = 'Continue to ' + finalCopy + ' online'

  return (
    '<p style="margin-top: 20px;">' +
      '<a id="' + escapeHtmlAttribute(generatedId) + '" ' +
        'class="btn btn-danger btn-lg text-decoration-underline" ' +
        'style="font-size:22px;color:white;padding:17px 20px;text-decoration:underline!important;text-decoration-thickness:3px!important;" ' +
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

function removeGeneratedButton(originalId) {
  const generatedId = 'Gen-' + originalId
  const btn = document.getElementById(generatedId)
  if (!btn) return

  const wrapper = btn.closest ? btn.closest('p') : null
  if (wrapper?.parentNode) {
    wrapper.parentNode.removeChild(wrapper)
  } else if (btn.parentNode) {
    btn.parentNode.removeChild(btn)
  }
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

/* ===========================
   Embed utilities
=========================== */

function ensureEmbedContainerExists(anchorEl, originalId, onReady) {
  const containerId = makeEmbedContainerId(originalId)

  let container = document.getElementById(containerId)

  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    anchorEl.insertAdjacentElement('afterend', container)
  }

  if (document.getElementById(containerId)) {
    onReady(containerId)
  } else {
    setTimeout(() => ensureEmbedContainerExists(anchorEl, originalId, onReady), 50)
  }
}

function removeEmbedContainer(containerId) {
  const container = document.getElementById(containerId)
  if (container?.parentNode) {
    container.parentNode.removeChild(container)
  }
}

/* ===========================
   Publish script handling
=========================== */

function injectPublishScriptAtEndOfBody(formIdNumber, targetId, done) {
  const body = document.body
  if (!body) {
    done?.({ ok: false })
    return
  }

  const src = 'https://sfmta.tfaforms.net/publish/' + formIdNumber

  const existing = document.querySelector(
    'script[data-fa-publish="true"][src="' + src + '"][data-qp-target-id="' + targetId + '"]'
  )

  if (existing) {
    done?.({ ok: true })
    return
  }

  const s = document.createElement('script')
  s.setAttribute('data-fa-publish', 'true')
  s.setAttribute('src', src)
  s.setAttribute('data-qp-target-id', targetId)
  s.defer = true

  let completed = false
  const finishOnce = payload => {
    if (completed) return
    completed = true
    done?.(payload)
  }

  const hardTimer = setTimeout(() => {
    finishOnce({ ok: false })
  }, 12000)

  s.onload = () => {
    clearTimeout(hardTimer)

    if (document.readyState !== 'loading' &&
        typeof window.loadFormAssemblyFormHeadAndBodyContents === 'function') {
      try {
        window.loadFormAssemblyFormHeadAndBodyContents()
      } catch (e) {
        console.warn('Manual FA init failed', e)
      }
    }

    finishOnce({ ok: true })
  }

  s.onerror = () => {
    clearTimeout(hardTimer)
    finishOnce({ ok: false })
  }

  body.appendChild(s)
}

function removePublishScript(formIdNumber, targetId) {
  const src = 'https://sfmta.tfaforms.net/publish/' + formIdNumber
  const selector = targetId
    ? 'script[data-fa-publish="true"][src="' + src + '"][data-qp-target-id="' + targetId + '"]'
    : 'script[data-fa-publish="true"][src="' + src + '"]'
  document.querySelectorAll(selector).forEach(s => s.parentNode?.removeChild(s))
}

/* ===========================
   Embed render validation
=========================== */

function validateEmbedRendered(containerId, callback) {
  const maxWaitMs = 6000
  const pollEveryMs = 150
  let waited = 0

  const tick = () => {
    const container = document.getElementById(containerId)
    if (
      container?.querySelector('form') ||
      container?.querySelector('#tfaContent') ||
      container?.querySelector('.wFormContainer') ||
      container?.querySelector('.wForm')
    ) {
      callback(true)
      return
    }

    waited += pollEveryMs
    if (waited >= maxWaitMs) {
      callback(false)
      return
    }

    setTimeout(tick, pollEveryMs)
  }

  tick()
}
