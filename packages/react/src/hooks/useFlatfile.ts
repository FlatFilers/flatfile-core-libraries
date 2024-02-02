import { useContext, useEffect, useState } from 'react'
import FlatfileContext from '../components/FlatfileContext'

export const useFlatfile = () => {
  const context = useContext(FlatfileContext)
  const { space, open, setOpen, setSpace, updateListener, listener } = context

  if (!context) {
    throw new Error('useFlatfile must be used within a FlatfileProvider')
  }

  const openPortal = () => {
    setOpen(true)
  }

  const closePortal = () => {
    setOpen(false)
  }

  return { openPortal, closePortal, open, updateListener, listener }
}
