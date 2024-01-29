/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import React from 'react'
import Space, { SpaceContents } from '../Space'
import { mockWorkbook } from '../../test/mocks'
import { CreateWorkbookConfig } from '@flatfile/api/api'
import '@testing-library/jest-dom'

const baseSpaceProps = {
  name: 'Embedded space',
  publishableKey: 'your-publishable-key',
  workbook: mockWorkbook as Pick<
    CreateWorkbookConfig,
    'name' | 'sheets' | 'actions'
  >,
}

describe('Space', () => {
  it('renders SpaceContents when spaceId, spaceUrl, pubNub and accessToken are provided', () => {
    const spaceId = 'spaceId'
    const spaceUrl = 'spaceUrl'
    const accessToken = 'accessToken'
    render(
      <Space
        spaceId={spaceId}
        environmentId="environmentId"
        spaceUrl={spaceUrl}
        accessToken={accessToken}
        {...baseSpaceProps}
      />
    )

    const spaceContentsElement = screen.getByTestId('space-contents')
    expect(spaceContentsElement).toBeInTheDocument()
  })

  it('does not render SpaceContents when spaceId, spaceUrl, or accessToken is missing', () => {
    const spaceId = 'spaceId'
    const spaceUrl = 'spaceUrl'
    const accessToken = ''

    render(
      <Space
        spaceId={spaceId}
        spaceUrl={spaceUrl}
        environmentId="environmentId"
        accessToken={accessToken}
        {...baseSpaceProps}
      />
    )

    const spaceContentsElement = screen.queryByTestId('space-contents')
    expect(spaceContentsElement).not.toBeInTheDocument()
  })
})

describe('SpaceContents', () => {
  it('renders the iframe and close button', () => {
    const spaceId = 'spaceId'
    const spaceUrl = 'spaceUrl'
    const accessToken = 'accessToken'

    render(
      <SpaceContents
        spaceId={spaceId}
        spaceUrl={spaceUrl}
        environmentId="environmentId"
        accessToken={accessToken}
        {...baseSpaceProps}
      />
    )

    const iframeElement = screen.getByTestId('flatfile_iFrameContainer')
    const closeButtonElement = screen.getByTestId('flatfile-close-button')

    expect(iframeElement).toBeInTheDocument()
    expect(closeButtonElement).toBeInTheDocument()
  })

  it('opens the confirmation modal when the close button is clicked', () => {
    const spaceId = 'spaceId'
    const spaceUrl = 'spaceUrl'
    const accessToken = 'accessToken'

    render(
      <SpaceContents
        spaceId={spaceId}
        spaceUrl={spaceUrl}
        environmentId="environmentId"
        accessToken={accessToken}
        {...baseSpaceProps}
      />
    )

    const closeButtonElement = screen.getByTestId('flatfile-close-button')
    closeButtonElement.click()

    const confirmationModalElement = screen.getByTestId('close-confirm-modal')
    expect(confirmationModalElement).toBeInTheDocument()
  })
})
