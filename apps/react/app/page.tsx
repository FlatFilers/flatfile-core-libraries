'use client'
import React from 'react'

import dynamic from 'next/dynamic'

const Example = dynamic(() => import('./App'), { ssr: false })

export default function Home() {
  return <Example />
}
