export const findDefaultPage = (createdSpace: any, defaultPage: any) => {
  if (!defaultPage) return
  if (defaultPage.document) {
    const document = createdSpace.documents.find(
      (d: any) => d.title === defaultPage.document
    )
    return {
      documentId: document.id,
    }
  }
  if (defaultPage.workbook) {
    if (defaultPage.workbook.sheet) {
      const sheet = createdSpace.workbooks[0].sheets.find(
        (s: any) => s.slug === defaultPage.workbook.sheet
      )
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
