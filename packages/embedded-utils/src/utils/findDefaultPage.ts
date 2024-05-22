export const findDefaultPage = (createdSpace: any, defaultPage: any) => {
  if (!defaultPage) return
  if (defaultPage.document) {
    const document = createdSpace.documents.find(
      (d: any) => d.title === defaultPage.document
    )

    if (!document)
      throw new Error(`Default Document ${defaultPage.document} not found`)
    return {
      documentId: document.id,
    }
  }
  if (defaultPage.workbook) {
    if (defaultPage.workbook.sheet) {
      const sheet = createdSpace.workbooks[0].sheets.find(
        (s: any) => s.slug === defaultPage.workbook.sheet
      )
      if (!sheet)
        throw new Error(`Default Sheet ${defaultPage.workbook.sheet} not found`)
      return {
        workbook: {
          workbookId: createdSpace.workbooks[0].id,
          sheetId: sheet.id,
        },
      }
    }
    return {
      workbook: {
        workbookId: createdSpace.workbooks[0].id,
      },
    }
  }
  return undefined
}
