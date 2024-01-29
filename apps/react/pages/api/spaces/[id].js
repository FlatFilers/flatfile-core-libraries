import api from '@flatfile/api'

export default async function handler(req, res) {
  const { id } = req.query
  try {
    const space = await api.spaces.get(id)
    res.json({ space })
  } catch (error) {
    console.error('Error retrieving space:', error)
    res.status(500).json({ error: 'Failed to retrieve space' })
  }
}
