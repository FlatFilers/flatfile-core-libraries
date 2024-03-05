import { useContext } from 'react'
import FlatfileContext from '../components/FlatfileContext'
import { initializeSpace } from '../utils/initializeSpace'
import { getSpace } from '../utils/getSpace'

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
  } = context

  const createSpace = async () => {
    if (publishableKey) {
      const createdSpace = await initializeSpace({
        publishableKey,
        environmentId,
        apiUrl,
      })
      if (createdSpace?.data.accessToken) {
        ;(window as any).CROSSENV_FLATFILE_API_KEY =
          createdSpace?.data.accessToken
        setAccessToken(createdSpace?.data.accessToken)
        setSessionSpace(createdSpace)
      }
    }
  }

  const reUseSpace = async () => {
    if (space) {
      const reUsedSpace = await getSpace({
        space,
        environmentId,
        apiUrl,
      })
      setAccessToken(space.accessToken)
      setSessionSpace(reUsedSpace)
    }
  }

  const openPortal = () => {
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

  return { openPortal, closePortal, open, setListener, listener }
}
