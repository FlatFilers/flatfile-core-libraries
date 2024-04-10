import { useContext } from 'react'
import FlatfileContext from '../components/FlatfileContext'
import { getSpace } from '../utils/getSpace'
import { createSpaceInternal } from '../utils/createSpaceInternal'

export const useFlatfile: () => {
  openPortal: () => void
  closePortal: () => void
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
  } = context

  const handleCreateSpace = async () => {
    if (!publishableKey) {
      return
    }

    // autoConfigure if no workbook or workbook.sheets are provided as they should be handled in the listener space:configure event
    const autoConfigure = !(createSpace.workbook && createSpace.workbook.sheets)
    const { data: createdSpace } = await createSpaceInternal({
      apiUrl,
      publishableKey,
      space: { ...createSpace.space, autoConfigure },
      workbook: createSpace.workbook,
      document: createSpace.document,
    })
    setAccessToken(createdSpace.space.accessToken)
    setSessionSpace(createdSpace)
    // A bit of a hack to wire up the Flatfile API key to the window object for internal client side @flatfile/api usage
    ;(window as any).CROSSENV_FLATFILE_API_KEY = createdSpace.space.accessToken
  }

  const handleReUseSpace = async () => {
    if (accessToken && 'id' in createSpace.space) {
      createSpace.space.accessToken = accessToken
      // TODO: Do we want to update the Space metadata / documents here if they pass that information? Feels like a no.
      const { data: reUsedSpace } = await getSpace({
        space: createSpace.space,
        apiUrl,
      })

      if (reUsedSpace.accessToken) {
        ;(window as any).CROSSENV_FLATFILE_API_KEY = reUsedSpace.accessToken
        setAccessToken(reUsedSpace.accessToken)
      }

      setSessionSpace({ space: reUsedSpace })
    }
  }

  const openPortal = () => {
    if (publishableKey && !accessToken) {
      handleCreateSpace()
    } else if (accessToken) {
      handleReUseSpace()
    }
    setOpen(true)
  }

  const closePortal = () => {
    setOpen(false)
    // TODO: Do we want to do any cleanup / remove the iFrame/listener from the DOM?
  }

  return {
    openPortal,
    closePortal,
    open,
    setListener,
    listener,
  }
}
