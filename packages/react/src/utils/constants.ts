import { Flatfile, FlatfileClient } from '@flatfile/api'
import {
  JobHandler,
  SheetHandler,
  SimpleOnboarding,
} from '@flatfile/embedded-utils'
import { FlatfileEvent } from '@flatfile/listener'

export const workbookOnSubmitAction = (sheetSlug?: string): Flatfile.Action => {
  const operation = sheetSlug
    ? `sheetSubmitAction-${sheetSlug}`
    : 'workbookSubmitAction'
  return {
    operation,
    mode: 'foreground',
    label: 'Submit',
    description: 'Action for handling data inside of onSubmit',
    primary: true,
  }
}

export const OnSubmitAction = (
  onSubmit: SimpleOnboarding['onSubmit'],
  onSubmitSettings: SimpleOnboarding['submitSettings']
) => {
  return async (event: FlatfileEvent) => {
    const { jobId, spaceId, workbookId } = event.context
    const FlatfileAPI = new FlatfileClient()
    try {
      await FlatfileAPI.jobs.ack(jobId, {
        info: 'Starting job',
        progress: 10,
      })

      const job = new JobHandler(jobId)
      const { data: workbookSheets } = await FlatfileAPI.sheets.list({
        workbookId,
      })

      // this assumes we are only allowing 1 sheet here (which we've talked about doing initially)
      const sheet = new SheetHandler(workbookSheets[0].id)

      if (onSubmit) {
        await onSubmit({ job, sheet, event })
      }

      await FlatfileAPI.jobs.complete(jobId, {
        outcome: {
          acknowledge: true,
          message: 'Submitting data is now complete!',
        },
      })
      if (onSubmitSettings?.deleteSpaceAfterSubmit) {
        await FlatfileAPI.spaces.archiveSpace(spaceId)
      }
    } catch (error: any) {
      if (jobId) {
        await FlatfileAPI.jobs.cancel(jobId)
      }
      console.log('Error:', error.stack)
    }
  }
}
