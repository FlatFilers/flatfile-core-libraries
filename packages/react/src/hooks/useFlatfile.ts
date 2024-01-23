import { useContext, useEffect, useState } from 'react'
import FlatfileContext from '../components/FlatfileContext'
import { initializeSpace } from '../utils/initializeSpace'
import { useFlatfileContext } from '../components'

export const useFlatfile = () => {
  const context = useContext(FlatfileContext)
  const { space, open, setOpen, setSpace } = context
  // const [open, setOpen] = useState(false)
  // const [space, setSpace] = useState<any>(null)
  if (!context) {
    throw new Error('useFlatfile must be used within a FlatfileProvider')
  }

  const openPortal = () => {
    // need to use the JS SDK here to open the portal
    console.log('openPortal')
    // setOpen(true)
    setOpen(true)
    // context.open = true
  }

  const closePortal = () => {
    // need to use the JS SDK here to close the portal
    console.log('closePortal', { open })
    // setOpen(false)
    setOpen(false)
    console.log('closePortal', { open })
    // context.open = false
  }

  return { openPortal, closePortal, open }
}
