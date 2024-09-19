import React, { version as ReactVersion } from 'react'
import ReactDOM from 'react-dom'

import App from './App'

ReactDOM.render(
  <>
    <h1>Hello world, I am React {ReactVersion}</h1>
    <App />
  </>,
  document.getElementById('root')
)
