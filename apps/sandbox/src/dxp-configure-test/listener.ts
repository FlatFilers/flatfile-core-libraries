import { MyWorkbook } from './my-dxp-workbook.js'
import { dxpConfigure } from '@flatfile/plugin-dxp-configure'

export default (listener) => {
  listener.use(dxpConfigure(MyWorkbook))
}
