import React from 'react'
import '../style.scss'

const DefaultError = ({ error }: { error: string | Error }) => {
  const errorMessage = typeof error === 'string' ? error : error.message

  return (
    <div className="ff_error_container">
      <h3 className="ff_error_heading">Something went wrong</h3>
      <p className="ff_error_text">{errorMessage}</p>
    </div>
  )
}

export default DefaultError
