// import React, { FC } from 'react'
// import { Box, Text } from 'ink'
// import Table from 'ink-table'
// import Spinner from 'ink-spinner'

// interface ApiResponseProps {
//   loading?: boolean
//   error?: string
//   data?: any
//   resource: string
//   method: string
// }

// const flattenObject = (obj: any, prefix = ''): any => {
//   return Object.keys(obj).reduce((acc: any, k: string) => {
//     const pre = prefix.length ? prefix + '.' : ''
//     if (
//       typeof obj[k] === 'object' && 
//       obj[k] !== null && 
//       !Array.isArray(obj[k]) &&
//       Object.keys(obj[k]).length < 5
//     ) {
//       Object.assign(acc, flattenObject(obj[k], pre + k))
//     } else {
//       acc[pre + k] = typeof obj[k] === 'object' ? JSON.stringify(obj[k]) : obj[k]
//     }
//     return acc
//   }, {})
// }

// const formatData = (data: any): any[] => {
//   if (Array.isArray(data)) {
//     return data.map(item => flattenObject(item))
//   }
//   return [flattenObject(data)]
// }

// const ApiResponse: FC<ApiResponseProps> = ({ loading, error, data, resource, method }) => {
//   if (loading) {
//     return (
//       <Box>
//         <Text color="blue">
//           <Spinner type="dots" />
//           {' Executing '}<Text color="green">{resource}.{method}</Text>...
//         </Text>
//       </Box>
//     )
//   }

//   if (error) {
//     return (
//       <Box flexDirection="column">
//         <Text color="red">✖ Error executing {resource}.{method}</Text>
//         <Text>{error}</Text>
//       </Box>
//     )
//   }

//   if (!data) {
//     return null
//   }

//   const formattedData = formatData(data)

//   return (
//     <Box flexDirection="column">
//       <Text color="green">✓ {resource}.{method} executed successfully</Text>
//       <Box marginTop={1}>
//         <Table data={formattedData} />
//       </Box>
//     </Box>
//   )
// }

// export { ApiResponse } 