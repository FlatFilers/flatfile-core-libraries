export function createIframe(
  mountElement: string,
  displayAsModal: boolean,
  spaceId?: string,
  token?: string,
  spacesUrl?: string,
  isReusingSpace?: boolean
): HTMLElement | null {
  const spacesURL = spacesUrl || 'https://spaces.flatfile.com'
  let url: string
  let iFrameContainer = document.getElementById(mountElement)

  if (!iFrameContainer) {
    iFrameContainer = document.createElement('div')
    iFrameContainer.id = mountElement
    document.body.appendChild(iFrameContainer)
  }

  // Construct the URL with the space ID and the token
  if (spaceId && token) {
    if (isReusingSpace) {
      url = `${spacesURL}/space/${spaceId}?token=${encodeURIComponent(token)}`
    } else {
      url = spacesURL
    }
  } else {
    url = `${spacesURL}/space-init`
    iFrameContainer.style.display = 'none'
  }
  
  // Create the iframe
  const iframe = document.createElement('iframe')
  iframe.src = url
  iframe.id = 'flatfile_iframe'

  // Create the wrapper
  const wrapper = document.createElement('div')
  wrapper.classList.add('flatfile_iframe-wrapper')
  wrapper.style.display = 'block'
  if (displayAsModal) wrapper.classList.add('flatfile_displayAsModal')

  const spinner = document.createElement('div')
  spinner.classList.add('ff_spinner')
  spinner.style.display = 'block'
  wrapper.appendChild(spinner)
  wrapper.appendChild(iframe)

  // Add the inner dom elements to the mountElement
  iFrameContainer.appendChild(wrapper)

  // Add an onload event to handle successful load
  iframe.onload = () => {
    spinner.style.display = 'none'
    console.log('Flatfile loaded successfully.')
  }

  // Add an onerror event to handle load errors
  iframe.onerror = () => {
    console.error('An error occurred while loading Flatfile.')
  }

  // Inject styles dynamically
  const styles = `
   :root {
  --ff-primary-color: #4c48ef;
  --ff-secondary-color: #616a7d;
  --ff-text-color: #090b2b;
  --ff-dialog-border-radius: 4px;
  --ff-border-radius: 5px;
  --ff-bg-fade: rgba(0, 0, 0, 0.2);
}

.flatfile_iframe-wrapper {
  display: none;
}

.flatfile_iframe-wrapper {
  min-width: 768px;
  min-height: 600px;
  width: 992px;
  height: 600px;
}

.flatfile_iframe-wrapper.flatfile_displayAsModal {
  box-sizing: content-box;
  position: fixed;
  top: 0;
  left: 0;
  width: calc(100% - 60px); /* 30px padding on the left and right */
  max-width: 100vw; /* viewport width */
  height: calc(100vh - 60px); /* 30px padding on the top and bottom */
  padding: 30px;
  background: var(--ff-bg-fade);
  z-index: 1000; 
}

.flatfile_displayAsModal .flatfile-close-button {
  position: absolute;
  z-index: 10;
  top: 35px;
  right: 35px;
  display: flex;
  justify-content: center;
  width: 25px;
  align-items: center;
  border-radius: 100%;
  cursor: pointer;
  border: none;
  background: #000;
  box-shadow: 0px 0px 10px 0px rgba(0,0,0,0.5);
  animation: glow 1.5s linear infinite alternate;
  transition: box-shadow 0.3s ease;
  height: 25px;
}

.flatfile_displayAsModal .flatfile-close-button:hover {
  box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.8);
}

.flatfile_displayAsModal .flatfile-close-button svg {
  fill: var(--ff-secondary-color);
  width: 10px;
}

#flatfile_iframe {
  border-width: 0px;
  width: 100%;
  height: 100%;
  padding: 16px 0;
  position: relative;
}

.flatfile_displayAsModal #flatfile_iframe {
  border-radius: var(--ff-border-radius);
  background: rgb(255, 255, 255);
}

.flatfile_outer-shell {
  background-color: var(--ff-bg-fade);
  border-radius: var(--ff-border-radius);
  top: 0;
  left: 0;
  width: calc(100% - 40px);
  height: calc(100vh - 40px);
  padding: 20px;
  display: block;
  overflow-y: auto;
  position: fixed;
  tab-size: 4;
  z-index: 1200;
}

.flatfile_inner-shell {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  min-height: 100%;
  padding: 0px;
  tab-size: 4;
  text-align: left;
}

.flatfile_modal {
  box-sizing: border-box;
  display: block;
  padding: 1.5em;
  tab-size: 4;
  text-align: left;
  background: #fff;
  min-width: 500px;
  max-width: 500px;
  border-radius: var(--ff-dialog-border-radius);
}

.flatfile_button-group {
  display: flex;
  justify-content: flex-end;
}

.flatfile_button {
  border: 0;
  border-radius: 1px;
  border-radius: 1px;
  margin-left: 15px;
  padding: 8px 12px;
  cursor: pointer;
}

.flatfile_primary {
  border: 1px solid var(--ff-primary-color);
  background-color: var(--ff-primary-color);
  color: #fff;
}

.flatfile_secondary {
  color: var(--ff-secondary-color);
}

.flatfile_modal-heading {
  font-size: 1.225em;
  font-weight: 600;
  margin-bottom: 0.4em;
  color: var(--ff-text-color);
}

.flatfile_modal-text {
  font-size: 14px;
  line-height: 1.25em;
  margin-bottom: 2em;
  color: var(--ff-secondary-color);
}

.ff_spinner {
  border: 4px solid rgba(255, 255, 255, 0.7);
  border-top: 4px solid var(--ff-primary-color);
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 999;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

`

  const styleElement = document.createElement('style')
  styleElement.innerHTML = styles
  document.head.appendChild(styleElement)

  return iFrameContainer
}
