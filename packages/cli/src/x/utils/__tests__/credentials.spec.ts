import { parseJWT } from '../credentials'

describe('credentials utilities', () => {
  describe('parseJWT', () => {
    it('should parse a valid JWT token', () => {
      // Create a simple JWT payload
      const payload = { exp: 1234567890, sub: 'test-user' }
      const encoded = Buffer.from(JSON.stringify(payload)).toString('base64')
      const token = `header.${encoded}.signature`

      const result = parseJWT(token)
      expect(result.exp).toBe(1234567890)
    })

    it('should handle invalid JWT tokens gracefully', () => {
      const result = parseJWT('invalid-token')
      expect(result).toEqual({})
    })

    it('should handle malformed JWT tokens', () => {
      const result = parseJWT('not.a.jwt')
      expect(result).toEqual({})
    })
  })
})
