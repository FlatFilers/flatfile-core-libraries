import { createIframe, initializeFlatfile } from '@flatfile/javascript'

import { config } from './config'
import { listener } from './listener'

const overrideLanguageSelect = document.getElementById('override-language')
/**
 * @description Sets a item in `localStorage` with key `'overrideLanguage'` and its
 * value is the selected option from `<overrideLanguageSelect>`.
 */
overrideLanguageSelect.addEventListener('change', () => {
  localStorage.setItem('overrideLanguage', overrideLanguageSelect.value)
})
const overrideLanguage = localStorage.getItem('overrideLanguage')
if (overrideLanguage) {
  overrideLanguageSelect.value = overrideLanguage
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
  exitPrimaryButtonText: 'CLOSE!',
  exitSecondaryButtonText: 'KEEP IT!',
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
/**
 * @description Sets up a Flatfile instance with the given `publishableKey`, and logs
 * the resulting `space` object to the console.
 * 
 * @param {string} publishableKey - 256-bitlong identifier that identifies the Spot
 * instance, which is utilized to submit an action and produce a close space occasion
 * with further information on the occurrence.
 */
window.initializeFlatfile = async (publishableKey) => {
  const flatfileOptions = {
    ...BASE_OPTIONS,
    publishableKey,
    closeSpace: {
      operation: 'submitActionFg',
      /**
       * @description Consoles the JSON-formatted event payload upon receiving a close space
       * event.
       * 
       * @param {object} event - space event to be logged and passed as a JSON string to
       * the `console.log()` method.
       */
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
/**
 * @description Preloads a Flatfile application and sets up an iframe to display it.
 */
window.preloadFlatfile = () => {
  createIframe('Flatfile_Preload_Iframe', true)
  window.initializePreloadedFlatfile = async (publishableKey) => {
    const flatfileOptions = {
      ...BASE_OPTIONS,
      publishableKey,
      mountElement: 'Flatfile_Preload_Iframe',
      closeSpace: {
        operation: 'submitActionFg',
        /**
         * @description Logs a close event's JSON-formatted payload to the console.
         * 
         * @param {object} event - space event that is passed to the function as its sole
         * argument and whose details are logged through the `console.log()` call using JSON
         * stringifying.
         */
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
