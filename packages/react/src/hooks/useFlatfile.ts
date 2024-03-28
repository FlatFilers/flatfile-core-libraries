import { useContext } from 'react'
import FlatfileContext from '../components/FlatfileContext'
import { getSpace } from '../utils/getSpace'
import { createSpaceInternal } from '../utils/createSpaceInternal'

export const useFlatfile = () => {
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
    environmentId,
    apiUrl,
    space,
    setSessionSpace,
    setAccessToken,
    createSpace,
  } = context

  const handleCreateSpace = async () => {
    if (!publishableKey) return
    const autoConfigure = createSpace.workbook && createSpace.workbook.sheets
    const { data: createdSpace } = await createSpaceInternal({
      apiUrl,
      publishableKey,
      space: { ...createSpace.space, autoConfigure: !autoConfigure },
      workbook: createSpace.workbook,
      document: createSpace.document,
    })
    console.log('createdSpace', { createdSpace })
    setAccessToken(createdSpace.space.accessToken)
    setSessionSpace(createdSpace.space)
    // A bit of a hack to wire up the Flatfile API key to the window object for internal client side @flatfile/api usage
    ;(window as any).CROSSENV_FLATFILE_API_KEY = createdSpace.space.accessToken
  }

  const handleReUseSpace = async () => {
    if (space && 'accessToken' in space) {
      // TODO: Do we want to update the Space metadata / documents here if they pass that information? Feels like a no.
      const { data: reUsedSpace } = await getSpace({
        space,
        environmentId,
        apiUrl,
      })

      ;(window as any).CROSSENV_FLATFILE_API_KEY = space.accessToken
      setAccessToken(space.accessToken)

      setSessionSpace(reUsedSpace)
    }
  }

  const openPortal = () => {
    if (publishableKey) {
      handleCreateSpace()
    } else if (space) {
      handleReUseSpace()
    }
    setOpen(true)
  }

  const closePortal = () => {
    setOpen(false)
    // TODO: Remove the iFrame from the DOM?
  }

  return {
    openPortal,
    closePortal,
    open,
    setListener,
    listener,
  }
}
