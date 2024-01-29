export interface ISidebarConfig {
  /**
   * Landing page upon loading a space
   * Defaults to primary workbook or first document, if there is one.
   */
  defaultPage?: {
    documentId?: string
    workbook?: {
      workbookId: string
      sheetId?: string
    }
  }
  /**
   * Toggle branding logo
   * Defaults to true
   */
  showPoweredByFlatfile?: boolean
  /**
   * Toggle ability to invite guests
   * Defaults to false
   */
  showGuestInvite?: boolean
  /**
   * Toggle data config for space
   * Defaults to false
   */
  showDataChecklist?: boolean
  /**
   * Toggle whether sidebar defaults to open inside of a Workbook
   * Defaults to false
   */
  showSidebar?: boolean
}
