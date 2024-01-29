import api from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'

export default function (listener: FlatfileListener) {
  listener.namespace(['*:red'], (red) => {
    red.filter({ job: 'space:configure' }, (configure) => {
      configure.on(
        'job:ready',
        async ({ context: { spaceId, environmentId, jobId } }) => {
          try {
            await api.jobs.ack(jobId, {
              info: 'Gettin started.',
              progress: 10,
            })

            await api.workbooks.create({
              spaceId,
              environmentId,
              name: 'Red',
              labels: ['primary'],
              // namespace: 'red',
              sheets: [
                {
                  name: 'Red Contacts',
                  slug: 'contacts',
                  fields: [
                    {
                      key: 'firstName',
                      type: 'string',
                      label: 'First Name',
                    },
                    {
                      key: 'lastName',
                      type: 'string',
                      label: 'Last Name',
                    },
                    {
                      key: 'email',
                      type: 'string',
                      label: 'Email',
                    },
                  ],
                  actions: [
                    {
                      operation: 'duplicate',
                      mode: 'background',
                      label: 'Duplicate Sheet',
                      type: 'string',
                      description:
                        'Duplicate this Sheet and lock down the original.',
                      primary: true,
                    },
                  ],
                },
              ],
              actions: [
                {
                  operation: 'submitActionFg',
                  mode: 'foreground',
                  label: 'Submit foreground',
                  type: 'string',
                  description: 'Submit data to webhook.site',
                  primary: true,
                },
              ],
            })

            await api.documents.create(spaceId, {
              title: 'Getting Started',
              body:
                '# Welcome\n' +
                '### Say hello to your first customer Space in the new Flatfile!\n' +
                "Let's begin by first getting acquainted with what you're seeing in your Space initially.\n" +
                '---\n',
            })

            await api.jobs.complete(jobId, {
              outcome: {
                message: 'This job is now complete.',
              },
            })
          } catch (error) {
            console.error('Error:', error.stack)

            await api.jobs.fail(jobId, {
              outcome: {
                message: 'This job encountered an error.',
              },
            })
          }
        }
      )
    })
  })

  listener.namespace(['space:green'], (green) => {
    green.filter({ job: 'space:configure' }, (configure) => {
      configure.on(
        'job:ready',
        async ({ context: { spaceId, environmentId, jobId } }) => {
          try {
            await api.jobs.ack(jobId, {
              info: 'Gettin started.',
              progress: 10,
            })

            await api.workbooks.create({
              spaceId,
              environmentId,
              name: 'Green',
              labels: ['primary'],
              sheets: [
                {
                  name: 'Green Contacts',
                  slug: 'contacts',
                  // namespace: 'green',
                  fields: [
                    {
                      key: 'firstName',
                      type: 'string',
                      label: 'First Name',
                    },
                    {
                      key: 'lastName',
                      type: 'string',
                      label: 'Last Name',
                    },
                    {
                      key: 'email',
                      type: 'string',
                      label: 'Email',
                    },
                  ],
                  actions: [
                    {
                      operation: 'duplicate',
                      mode: 'background',
                      label: 'Duplicate Sheet',
                      type: 'string',
                      description:
                        'Duplicate this Sheet and lock down the original.',
                      primary: true,
                    },
                  ],
                },
              ],
              actions: [
                {
                  operation: 'submitActionFg',
                  mode: 'foreground',
                  label: 'Submit foreground',
                  type: 'string',
                  description: 'Submit data to webhook.site',
                  primary: true,
                },
              ],
            })

            await api.documents.create(spaceId, {
              title: 'Getting Started',
              body:
                '# Welcome\n' +
                '### Say hello to your first customer Space in the new Flatfile!\n' +
                "Let's begin by first getting acquainted with what you're seeing in your Space initially.\n" +
                '---\n',
            })

            await api.jobs.complete(jobId, {
              outcome: {
                message: 'This job is now complete.',
              },
            })
          } catch (error) {
            console.error('Error:', error.stack)

            await api.jobs.fail(jobId, {
              outcome: {
                message: 'This job encountered an error.',
              },
            })
          }
        }
      )
    })
  })
}
