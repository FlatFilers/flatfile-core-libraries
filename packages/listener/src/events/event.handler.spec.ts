import { CrossEnvConfig } from '@flatfile/cross-env-config'
import { EventHandler } from './event.handler'

describe('EventHandler', () => {
  let testFn: jest.Mock

  if (CrossEnvConfig.get('AGENT_INTERNAL_URL') == null) {
    process.env.AGENT_INTERNAL_URL = 'agent_internal_url'
  }

  beforeEach(() => {
    testFn = jest.fn()
  })

  describe('triggering', () => {
    test('triggers basic event listeners', () => {
      const handler = new EventHandler().on('foo', testFn)

      handler.dispatchEvent({ topic: 'foo' })
      expect(testFn).toHaveBeenCalledTimes(1)
    })

    test('triggers namespaced event listeners', () => {
      const handler = new EventHandler().on('records:created', testFn)

      handler.dispatchEvent({ topic: 'records:created' })
      expect(testFn).toHaveBeenCalled()
    })

    test('triggers event listener for array of events', () => {
      const handler = new EventHandler().on(
        ['records:created', 'records:updated'],
        testFn
      )

      handler.dispatchEvent({ topic: 'records:created' })
      handler.dispatchEvent({ topic: 'records:updated' })
      expect(testFn).toHaveBeenCalledTimes(2)
    })

    test('triggers event listener for wildcard query of events', () => {
      const handler = new EventHandler().on('records:*', testFn)

      handler.dispatchEvent({ topic: 'records:created' })
      handler.dispatchEvent({ topic: 'records:updated' })
      handler.dispatchEvent({ topic: 'records:deleted' })
      expect(testFn).toHaveBeenCalledTimes(3)
    })
  })

  describe('filtering', () => {
    test('trigger only when filter match - on listener', () => {
      const handler = new EventHandler().on(
        'records:created',
        { domain: 'foo' },
        testFn
      )

      handler.dispatchEvent({ topic: 'records:created' })
      handler.dispatchEvent({ topic: 'records:created', domain: 'foo' })
      expect(testFn).toHaveBeenCalledTimes(1)
    })

    test('trigger only when filter match - on scope', () => {
      const handler = new EventHandler({ domain: 'foo' }).on(
        'records:created',
        testFn
      )

      handler.dispatchEvent({ topic: 'records:created' })
      handler.dispatchEvent({ topic: 'records:created', domain: 'foo' })
      expect(testFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('child node', () => {
    test('trigger a listener on a child node', async () => {
      const handler = new EventHandler().addNode(
        new EventHandler().on('records:created', testFn)
      )
      await handler.dispatchEvent({ topic: 'records:created' })
      expect(testFn).toHaveBeenCalledTimes(1)
    })

    test('trigger only when filter match - on scope', async () => {
      const handler = new EventHandler().addNode(
        new EventHandler({ domain: 'foo' }).on('records:created', testFn)
      )
      await handler.dispatchEvent({ topic: 'records:created' })
      await handler.dispatchEvent({ topic: 'records:created', domain: 'foo' })
      expect(testFn).toHaveBeenCalledTimes(1)
    })
  })

  describe('AGENT_INTERNAL_URL', () => {
    test('throws error when not set', () => {
      process.env.AGENT_INTERNAL_URL = undefined
      expect(() => new EventHandler()).toThrow(
        'AGENT_INTERNAL_URL must be set in the environment'
      )
    })
  })
})
