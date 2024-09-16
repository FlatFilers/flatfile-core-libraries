import React, { useState } from 'react'
import { useSpace } from '@flatfile/react'

const ReusableSpaceExample: React.FC = () => {
  const [spaceId, setSpaceId] = useState<string | null>(null)
  const { space, loading, error } = useSpace({
    name: 'Reusable Space Example',
    publishableKey: 'YOUR_PUBLISHABLE_KEY',
    environmentId: 'YOUR_ENVIRONMENT_ID',
    spaceId: spaceId,
  })

  const handleCreateSpace = async () => {
    if (space) {
      const newSpace = await space.create()
      setSpaceId(newSpace.id)
    }
  }

  const handleOpenSpace = () => {
    if (space) {
      space.open()
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h1>Reusable Space Example</h1>
      <button onClick={handleCreateSpace} disabled={!!spaceId}>
        Create Space
      </button>
      <button onClick={handleOpenSpace} disabled={!spaceId}>
        Open Space
      </button>
      {spaceId && <p>Space ID: {spaceId}</p>}
    </div>
  )
}

export default ReusableSpaceExample
