import api, { Flatfile } from '@flatfile/api'
import { FlatfileListener } from '@flatfile/listener'

export const config: Pick<
  Flatfile.CreateWorkbookConfig,
  'name' | 'sheets' | 'actions'
> = {
  name: 'Brewery workbook',
  sheets: [
    {
      name: 'TestSheet',
      slug: 'TestSheet',
      fields: [
        {
          key: 'brewery-name',
          type: 'string',
          label: 'Brewery name',
          constraints: [
            {
              type: 'required',
            },
          ],
        },
        {
          key: 'brewery-exists',
          type: 'string',
          label: 'Brewery Exists?',
        },
      ],
      actions: [
        {
          label: 'Verify breweries',
          operation: 'breweries:verify',
          description: 'Would you like to verify breweries?',
          mode: 'foreground',
          confirm: true,
        },
      ],
    },
  ],
  actions: [
    {
      label: 'Submit',
      operation: 'breweries:submit',
      description: 'Would you like to submit your workbook?',
      mode: 'foreground',
      primary: true,
      confirm: true,
    },
  ],
}

async function verifyBreweries(jobId: string, sheetId: string) {
  try {
    await api.jobs.ack(jobId, {
      info: "I'm starting the job - inside client",
      progress: 33,
    })

    if (!jobId) {
      throw new Error('Missing jobId')
    }

    if (!sheetId) {
      throw new Error('Missing sheetId')
    }

    // fetch Flatfile records by sheet
    const records = await api.records.get(sheetId)
    if (!records) return

    console.log(records)

    // hit external brewery api
    const breweries = await fetch('https://api.openbrewerydb.org/breweries')
      .then((res) => {
        return res.json()
      })
      .then((data) => {
        return data
      })

    console.log(breweries)

    // verify Flatfile data against brewery DB
    const recordsUpdates = records?.data.records?.map((record: any) => {
      const breweryNameRecordValue = record.values['brewery-name'].value
      const matchingBrewery = breweries.find((brewery: any) => {
        return brewery.name === breweryNameRecordValue
      })
      console.log('matchingBrewery', matchingBrewery)
      if (matchingBrewery) {
        record.values['brewery-exists'].value = 'Exists in DB'
      }
      return record
    })

    // update Flatfile records
    await api.records.update(sheetId, recordsUpdates as Flatfile.Record_[])

    // complete the job
    await api.jobs.complete(jobId, {
      info: 'Brewery verification job is complete!',
    })
  } catch (error) {
    console.error('An error occurred:', error)
    await api.jobs.fail(jobId, {
      info: 'Brewery verification job did not complete.',
    })
  }
}

async function submit(jobId: string) {
  try {
    await api.jobs.ack(jobId, {
      info: "I'm starting the job - inside client",
      progress: 33,
    })

    // hit your API here
    await new Promise((res) => setTimeout(res, 2000))

    await api.jobs.complete(jobId, {
      info: "Job's work is done",
      outcome: { next: { type: 'wait' } },
    })
  } catch (error) {
    console.error('An error occurred:', error)
    await api.jobs.fail(jobId, {
      info: 'Job did not complete.',
    })
  }
}

/**
 * Example Listener
 */
export const listener = FlatfileListener.create((client) => {
  client.on(
    'job:ready',
    // @ts-ignore
    { payload: { operation: 'breweries:verify' } },
    async (event: any) => {
      const { context } = event
      console.log('context: ', context)
      return verifyBreweries(context.jobId, context.sheetId)
    }
  )

  client.on(
    'job:ready',
    // @ts-ignore
    { payload: { operation: 'breweries:submit' } },
    async (event: any) => {
      const { context } = event
      console.log('context: ', context)
      return submit(context.jobId)
    }
  )
})
