import { Flatfile } from '@flatfile/api'

export const mockWorkbook: Flatfile.Workbook = {
  id: 'wb-id',
  environmentId: 'your-environment-id',
  sheets: [],
  name: 'Test Workbook',
  actions: [],
  spaceId: 'test-space-id',
  createdAt: new Date('01/01/2000'),
  updatedAt: new Date('01/01/2001'),
}

export const mockSheetConfig: Flatfile.SheetConfig = {
  name: 'Sheet Name',
  slug: 'sheet-slug',
  fields: [
    { key: 'field-1', label: 'Field 1', type: 'string' },
    { key: 'field-2', label: 'Field 2', type: 'string' },
  ],
}

export const mockDocument = {
  id: 'doc-id',
  title: 'Example-title',
  body: 'Example-body',
  createdAt: new Date('01/01/2000'),
  updatedAt: new Date('01/01/2001'),
}

export const mockSpace: Flatfile.Space = {
  name: 'Test Space',
  guestAuthentication: ['shared_link', 'magic_link'],
  id: 'space-id',
  environmentId: 'your-environment-id',
  accessToken: 'access-token',
  createdAt: new Date('01/01/2000'),
  updatedAt: new Date('01/01/2001'),
  isCollaborative: true,
  guestLink: 'fake-url',
}
