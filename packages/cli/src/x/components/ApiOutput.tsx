import React, { FC } from 'react'
import { Text, Box } from 'ink'
import Spinner from 'ink-spinner'

interface ApiOutputProps {
    loading?: boolean
    error?: string
    data?: any
    resource: string
    method: string
}

const parseJsonString = (str: string) => {
    try {
        return JSON.parse(str)
    } catch {
        return str
    }
}

const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
        return value.map(v => formatValue(v)).join('\n  ')
    }
    if (typeof value === 'object' && value !== null) {
        return Object.entries(value)
            .map(([k, v]) => `${k}: ${formatValue(v)}`)
            .join('\n  ')
    }
    return String(value)
}

const Section: FC<{ label: string, value: any }> = ({ label, value }) => (
    <Box flexDirection="column" marginBottom={1}>
        <Text color="cyan" bold>{label}:</Text>
        <Text color="white">  {formatValue(value)}</Text>
    </Box>
)

const GroupedOutput: FC<{ data: any }> = ({ data }) => {
    // Unwrap the nested data structure
    const unwrapData = (d: any) => {
        if (d?.data?.data) return d.data.data
        if (d?.data) return d.data
        return d
    }
    
    const parsedData = unwrapData(data)

    return (
        <Box flexDirection="column">
            <Box flexDirection="column" marginBottom={1}>
                <Text backgroundColor="blue" color="white" bold> Basic Information </Text>
                <Section label="ID" value={parsedData.id} />
                <Section label="Name" value={parsedData.name} />
                <Section label="Environment" value={parsedData.environmentId} />
                <Section label="Space" value={parsedData.spaceId} />
                <Section label="Labels" value={parsedData.labels} />
            </Box>

            {parsedData.sheets && (
                <Box flexDirection="column" marginBottom={1}>
                    <Text backgroundColor="magenta" color="white" bold> Sheets </Text>
                    {parsedData.sheets.map((sheet: any, i: number) => (
                        <Box key={i} flexDirection="column" marginLeft={2} marginBottom={1}>
                            <Text bold underline>{sheet.name}</Text>
                            {sheet.config?.fields && (
                                <Box flexDirection="column" marginLeft={2}>
                                    <Text bold>Fields:</Text>
                                    {sheet.config.fields.map((field: any, j: number) => (
                                        <Box key={j} marginLeft={2}>
                                            <Text>• <Text bold>{field.label}</Text> ({field.key}) - {field.type}</Text>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                            {sheet.recordCounts && (
                                <Box flexDirection="column" marginLeft={2}>
                                    <Text bold>Records:</Text>
                                    <Text>  Total: {sheet.recordCounts.total}</Text>
                                    <Text>  Valid: {sheet.recordCounts.valid}</Text>
                                    <Text>  Errors: {sheet.recordCounts.error}</Text>
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            )}

            {parsedData.actions && (
                <Box flexDirection="column" marginBottom={1}>
                    <Text backgroundColor="green" color="white" bold> Actions </Text>
                    {parsedData.actions.map((action: any, i: number) => (
                        <Box key={i} flexDirection="column" marginLeft={2} marginBottom={1}>
                            <Text bold>{action.label}</Text>
                            <Text>  Operation: {action.operation}</Text>
                            <Text>  Mode: {action.mode}</Text>
                            {action.description && <Text>  Description: {action.description}</Text>}
                        </Box>
                    ))}
                </Box>
            )}

            <Box flexDirection="column">
                <Text backgroundColor="yellow" color="black" bold> Timestamps </Text>
                <Section label="Created" value={new Date(parsedData.createdAt).toLocaleString()} />
                <Section label="Updated" value={new Date(parsedData.updatedAt).toLocaleString()} />
            </Box>
        </Box>
    )
}

export const ApiOutput: FC<ApiOutputProps> = ({ loading, error, data, resource, method }) => {
    if (loading) {
        return (
            <Text>
                <Text color="blue">
                    <Spinner type="dots" />
                    {' Executing '}
                </Text>
                <Text color="green">{resource}.{method}</Text>
                <Text color="blue">...</Text>
            </Text>
        )
    }

    if (error) {
        return (
            <Text color="red">
                ✖ Error executing {resource}.{method}: {error}
            </Text>
        )
    }

    if (!data) {
        return null
    }

    return (
        <Box flexDirection="column">
            <Text color="green">✓ {resource}.{method} executed successfully{'\n'}</Text>
            <GroupedOutput data={data} />
        </Box>
    )
} 