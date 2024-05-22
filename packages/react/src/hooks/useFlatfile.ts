import { updateDefaultPageInSpace } from '@flatfile/embedded-utils'
import { useContext, useEffect } from 'react'
import FlatfileContext from '../components/FlatfileContext'
import { ClosePortalOptions } from '../types'
import { convertDatesToISO } from '../utils/convertDatesToISO'
import { createSpaceInternal } from '../utils/createSpaceInternal'
import { getSpace } from '../utils/getSpace'

export const useFlatfile: () => {
  openPortal: () => void
  closePortal: (options?: ClosePortalOptions) => void
  open: boolean
  setListener: (listener: any) => void
  listener: any
} = () => {
  const context = useContext(FlatfileContext)

  if (!context) {
    throw new Error('useFlatfile must be used within a FlatfileProvider')
  }

  const {
    open,
    setOpen,
    setListener,
    listener,
    publishableKey,
    apiUrl,
    setSessionSpace,
    accessToken,
    setAccessToken,
    createSpace,
    defaultPage,
    resetSpace,
    ready,
  } = context

  const handleCreateSpace = async () => {
    if (!publishableKey) {
      return
    }
    // autoConfigure if no workbook or workbook.sheets are provided as they should be handled in the listener space:configure event
    const autoConfigure = !createSpace.workbook?.sheets
    const { data: createdSpace } = await createSpaceInternal({
      apiUrl,
      publishableKey,
      space: { ...createSpace.space, autoConfigure },
      workbook: createSpace.workbook,
      document: createSpace.document,
    })
    // A bit of a hack to wire up the Flatfile API key to the window object for internal client side @flatfile/api usage
    ;(window as any).CROSSENV_FLATFILE_API_KEY = createdSpace.space.accessToken

    if (defaultPage) await updateDefaultPageInSpace(createdSpace, defaultPage)

    setAccessToken(createdSpace.space.accessToken)
    setSessionSpace(createdSpace)
  }

  const handleReUseSpace = async () => {
    if (accessToken && 'id' in createSpace.space) {
      createSpace.space.accessToken = accessToken
      const { data: reUsedSpace } = await getSpace({
        space: createSpace.space,
        apiUrl,
      })

      if (reUsedSpace.accessToken) {
        ;(window as any).CROSSENV_FLATFILE_API_KEY = reUsedSpace.accessToken
        setAccessToken(reUsedSpace.accessToken)
      }

      setSessionSpace({ space: convertDatesToISO(reUsedSpace) })
    }
  }

  useEffect(() => {
    const createOrUpdateSpace = async () => {
      if (publishableKey && !accessToken) {
        await handleCreateSpace()
      } else if (accessToken && !publishableKey) {
        await handleReUseSpace()
      }
    }

    if (ready && open) {
      createOrUpdateSpace()
    }
  }, [ready, open])

  const openPortal = () => {
    ;(window as any).CROSSENV_FLATFILE_API_URL = apiUrl
    setOpen(true)
  }

  const closePortal = (options?: ClosePortalOptions) => {
    resetSpace(options)
  }

  return {
    openPortal,
    closePortal,
    open,
    setListener,
    listener,
    ready,
  }
}
