import { useContext } from 'react'
import FlatfileContext from '../components/FlatfileContext'

export const useFlatfile = () => {
  const context = useContext(FlatfileContext)
  const { open, setOpen, setListener, listener } = context

  if (!context) {
    throw new Error('useFlatfile must be used within a FlatfileProvider')
  }

  const openPortal = () => {
    setOpen(true)
  }

  const closePortal = () => {
    setOpen(false)
  }

  return { openPortal, closePortal, open, setListener, listener }
}
