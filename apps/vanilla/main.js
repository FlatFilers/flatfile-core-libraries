import { createIframe, initializeFlatfile } from '@flatfile/javascript'

import { config } from './config'
import { listener } from './listener'

const overrideLanguageSelect = document.getElementById('override-language')
overrideLanguageSelect.addEventListener('change', () => {
  localStorage.setItem('overrideLanguage', overrideLanguageSelect.value)
})
const overrideLanguage = localStorage.getItem('overrideLanguage')
if (overrideLanguage) {
  overrideLanguageSelect.value = overrideLanguage
}

function overrideByKey(key) {
  const overrideSelect = document.getElementById(`override-${key}`)
  function createAndSelectOption(newValue) {
    overrideSelect.value = newValue
    if (overrideSelect.value !== newValue) {
      const newOption = document.createElement('option')
      newOption.setAttribute('value', newValue)
      newOption.textContent = newValue
      overrideSelect.appendChild(newOption)
      overrideSelect.value = newValue
    }
  }
  overrideSelect.addEventListener('change', () => {
    if (overrideSelect.value === 'other') {
      const newValue = prompt(`Enter new value for ${key}:`)
      if (typeof newValue === 'string' && newValue.length > 0) {
        createAndSelectOption(newValue)
      } else {
        overrideSelect.value = 'default'
      }
    }
    localStorage.setItem(`override-${key}`, overrideSelect.value)
  })
  const override = localStorage.getItem(`override-${key}`)
  if (typeof override === 'string' && override.length > 0) {
    createAndSelectOption(override)
  }
  return overrideSelect
}

const overrideApiUrlSelect = overrideByKey('api-url')
const overrideSpaceUrlSelect = overrideByKey('space-url')
overrideByKey('publishable-key')

function getUrls() {
  const apiUrl = overrideApiUrlSelect.value
  const spaceUrl = overrideSpaceUrlSelect.value
  return {
    ...(apiUrl === 'default' ? {} : { apiUrl }),
    ...(spaceUrl === 'default' ? {} : { spaceUrl }),
  }
}

/*
// ---Get a space to reuse it, load automatically
const flatfile = new FlatfileClient({
  token: 'sk_1234',
  environment: 'https://platform.flatfile.com/api/v1',
})

function getSpace() {
  return flatfile.spaces.get('us_sp_b8n0VLxN')
}

getSpace()
  .then((space) => {
    const flatfileOptions = {
      publishableKey: 'pk_1234',
      space: {
        id: space?.data.id,
        accessToken: space?.data.accessToken,
      },
      // Additional parameters...
    }
    // Load automatically
    initializeFlatfile(flatfileOptions)
  })
  .catch((error) => {
    console.error('Error retrieving space:', error)
  })
//-- end
*/

const BASE_OPTIONS = {
  languageOverride: overrideLanguageSelect.value,
  spaceBody: { name: 'Hello' },
  // listener,
  // Additional parameters...
  workbook: config,
  // exitPrimaryButtonText: 'CLOSE!',
  // exitSecondaryButtonText: 'KEEP IT!',
  document: {
    title: 'my title',
    body: 'my body',
    defaultPage: true,
  },
  themeConfig: {
    root: {
      primaryColor: '#090B2B',
      dangerColor: '#F44336',
      warningColor: '#FF9800',
    },
    document: {
      borderColor: '#CAD0DC',
    },
    sidebar: {
      logo: 'https://images.ctfassets.net/hjneo4qi4goj/5DNClD4reUBKoF7u01OgKF/2aa12c49c5ea97bac013a7546e453738/flatfile-white.svg',
      textColor: '#ECEEFF',
      titleColor: '#C4C9FF',
      focusBgColor: '#6673FF',
      focusTextColor: '#FFF',
      backgroundColor: '#090B2B',
      footerTextColor: '#C4C9FF',
      textUltralightColor: '#B9DDFF',
      borderColor: '#2E3168',
      activeTextColor: '#FFF',
    },
    table: {},
  },
  sidebarConfig: {
    showGuestInvite: true,
    showDataChecklist: true,
    showSidebar: true,
  },
  listener,
  namespace: 'my-namespace',
}
// ---Create a new Space + Workbook and load an iFrame
window.initializeFlatfile = async (publishableKey) => {
  const flatfileOptions = {
    ...BASE_OPTIONS,
    ...getUrls(),
    publishableKey,
    closeSpace: {
      operation: 'submitActionFg',
      onClose: (event) => {
        console.log(
          `Close space event payload: ${JSON.stringify(event, null, 2)}`
        )
      },
    },
  }

  const space = await initializeFlatfile(flatfileOptions)
  console.log({ space })
}

// ---Pre-load iFrame by specific mountID for faster initial load-time
window.preloadFlatfile = () => {
  createIframe('Flatfile_Preload_Iframe', true)
  window.initializePreloadedFlatfile = async (publishableKey) => {
    const flatfileOptions = {
      ...BASE_OPTIONS,
      ...getUrls(),
      publishableKey,
      mountElement: 'Flatfile_Preload_Iframe',
      closeSpace: {
        operation: 'submitActionFg',
        onClose: (event) => {
          console.log(
            `Close space event payload: ${JSON.stringify(event, null, 2)}`
          )
        },
      },
    }
    await initializeFlatfile(flatfileOptions)
  }
}
//-- end

/* 
//---load automatically with a new space each time
const flatfileOptions = {
  publishableKey: 'pk_1234',
  // Additional parameters...
}
initializeFlatfile(flatfileOptions)
//-- end
 */
