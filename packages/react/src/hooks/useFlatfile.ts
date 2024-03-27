import { useContext } from 'react'
import FlatfileContext from '../components/FlatfileContext'
import { initializeSpace } from '../utils/initializeSpace'
import { getSpace } from '../utils/getSpace'
import { authenticate } from '../utils/authenticate'
import { addSpaceInfo } from '../utils/addSpaceInfo'

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
    flatfileConfiguration,
  } = context

  const createSpace = async () => {
    // if Workbook child is available then create space with Workbook
    // if Space Document child is available then create space with Document
    if (publishableKey) {
      const { data: createdSpace } = await initializeSpace({
        publishableKey,
        environmentId,
        apiUrl,
        ...space,
        ...flatfileConfiguration,
      })

      if (createdSpace?.accessToken) {
        ;(window as any).CROSSENV_FLATFILE_API_KEY = createdSpace?.accessToken

        setAccessToken(createdSpace?.accessToken)
        setSessionSpace(createdSpace)

        const fullAccessApi = authenticate(createdSpace?.accessToken, apiUrl)

        // TODO: Remove this when we have a 1 endpoint solution
        await addSpaceInfo(
          flatfileConfiguration,
          createdSpace?.id,
          fullAccessApi
        )
      }
    }
  }

  const reUseSpace = async () => {
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
      createSpace()
    } else if (space) {
      reUseSpace()
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
