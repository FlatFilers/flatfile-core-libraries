import { Workbook } from '@flatfile/api/api'
import { Space } from '@flatfile/api/api/resources/spaces/types'

export const mockWorkbook: Workbook = {
  id: 'wb-id',
  environmentId: 'your-environment-id',
  sheets: [],
  name: 'Test Workbook',
  actions: [],
  spaceId: 'test-space-id',
  createdAt: new Date('01/01/2000'),
  updatedAt: new Date('01/01/2001'),
}

export const mockDocument = {
  id: 'doc-id',
  title: 'Example-title',
  body: 'Example-body',
  createdAt: new Date('01/01/2000'),
  updatedAt: new Date('01/01/2001'),
}

export const mockSpace: Space = {
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
