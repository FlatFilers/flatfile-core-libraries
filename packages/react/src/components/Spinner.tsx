import React from 'react'

/**
 * @description Renders an animated spinner icon with the given class name and test
 * ID for use in React applications.
 * 
 * @returns {HTMLDivElement} an HTML `<div>` element with a class of `spinner` and a
 * data-testid of `"spinner-icon"`."
 * 
 * 	* `className`: This is a string that represents the CSS class name for the spinner
 * element.
 * 	* `data-testid`: This is an attribute that assigns a unique identifier to the
 * spinner element, allowing developers to easily identify and manipulate it in their
 * code.
 * 	* `<div>`: This is the HTML element that represents the spinner itself.
 */
const Spinner = () => {
  return <div className="spinner" data-testid="spinner-icon" />
}

export default Spinner
