import { useContext } from 'react'
import FlatfileContext from '../components/FlatfileContext'
import { initializeSpace } from '../utils/initializeSpace'
import { getSpace } from '../utils/getSpace'
import { authenticate } from '../utils/authenticate'
import { addSpaceInfo } from '../utils/addSpaceInfo'

export const useFlatfile = () => {
  const context = useContext(FlatfileContext)
  const { open, setOpen, setListener, listener } = context

  if (!context) {
    throw new Error('useFlatfile must be used within a FlatfileProvider')
  }

  const {
    publishableKey,
    environmentId,
    apiUrl,
    space,
    setSessionSpace,
    accessToken,
    setAccessToken,
    flatfileConfiguration,
    setFlatfileConfiguration,
  } = context

  const createSpace = async () => {
    console.log('createSpace', flatfileConfiguration)
    // if Workbook child is available then create space with Workboo
    // if Space Document child is available then create space with Document
    if (publishableKey) {
      const { data: createdSpace } = await initializeSpace({
        publishableKey,
        environmentId,
        apiUrl,
        ...flatfileConfiguration,
      })

      console.log({ createdSpace, SPACE_ID: createdSpace?.id })
      if (createdSpace?.accessToken) {
        ;(window as any).CROSSENV_FLATFILE_API_KEY = createdSpace?.accessToken
        setAccessToken(createdSpace?.accessToken)
        setSessionSpace(createdSpace)

        console.log({ flatfileConfiguration, publishableKey, accessToken })

        const fullAccessApi = authenticate(createdSpace?.accessToken, apiUrl)

        console.log('addSpaceInfo', { createdSpace, fullAccessApi })

        // Remove this when we have a 1 endpoint solution
        await addSpaceInfo(
          flatfileConfiguration,
          createdSpace?.id,
          fullAccessApi
        )
      }
    }
  }

  const reUseSpace = async () => {
    if (space) {
      const { data: reUsedSpace } = await getSpace({
        space,
        environmentId,
        apiUrl,
      })
      setAccessToken(space.accessToken)
      setSessionSpace(reUsedSpace)
    }
  }

  const openPortal = () => {
    console.log('openPortal', { context, publishableKey: !!publishableKey })
    if (!!publishableKey) {
      createSpace()
    } else if (space) {
      reUseSpace()
    }
    setOpen(true)
  }

  const closePortal = () => {
    setOpen(false)
  }

  return {
    openPortal,
    closePortal,
    open,
    setListener,
    listener,
    flatfileConfiguration,
    setFlatfileConfiguration,
  }
}
