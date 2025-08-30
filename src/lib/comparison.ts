import { EndpointSpec, Conflict, EndpointStatus } from '@/types'

export function compareSpecs(frontendSpec: EndpointSpec, backendSpec: EndpointSpec): {
    status: EndpointStatus
    conflicts: Conflict[]
} {
    const conflicts: Conflict[] = []

    // Si alguna spec está vacía
    if (!frontendSpec.definedBy && !backendSpec.definedBy) {
        return { status: 'undefined', conflicts: [] }
    }

    if (!frontendSpec.definedBy || !backendSpec.definedBy) {
        return { status: 'pending', conflicts: [] }
    }

    // Comparar parámetros
    const frontendParams = frontendSpec.parameters || []
    const backendParams = backendSpec.parameters || []

    conflicts.push(...compareFields(frontendParams, backendParams, 'parameters'))

    // Comparar request body
    const frontendRequest = frontendSpec.requestBody || []
    const backendRequest = backendSpec.requestBody || []

    conflicts.push(...compareFields(frontendRequest, backendRequest, 'requestBody'))

    // Comparar response body
    const frontendResponse = frontendSpec.responseBody || []
    const backendResponse = backendSpec.responseBody || []

    conflicts.push(...compareFields(frontendResponse, backendResponse, 'responseBody'))

    // Comparar status codes
    const frontendCodes = new Set(frontendSpec.statusCodes || [])
    const backendCodes = new Set(backendSpec.statusCodes || [])

    if (frontendCodes.size > 0 && backendCodes.size > 0) {
        const hasCommonCodes = [...frontendCodes].some(code => backendCodes.has(code))
        if (!hasCommonCodes) {
            conflicts.push({
                field: 'statusCodes',
                frontendValue: Array.from(frontendCodes),
                backendValue: Array.from(backendCodes),
                type: 'type_mismatch'
            })
        }
    }

    return {
        status: conflicts.length > 0 ? 'conflict' : 'synced',
        conflicts
    }
}

function compareFields(frontendFields: any[], backendFields: any[], fieldType: string): Conflict[] {
    const conflicts: Conflict[] = []
    const frontendMap = new Map(frontendFields.map(f => [f.name, f]))
    const backendMap = new Map(backendFields.map(f => [f.name, f]))

    // Verificar campos que están en frontend pero no en backend
    for (const [name, field] of frontendMap) {
        if (!backendMap.has(name)) {
            conflicts.push({
                field: `${fieldType}.${name}`,
                frontendValue: field,
                backendValue: null,
                type: 'missing'
            })
        } else {
            const backendField = backendMap.get(name)

            // Verificar tipo
            if (field.type !== backendField.type) {
                conflicts.push({
                    field: `${fieldType}.${name}.type`,
                    frontendValue: field.type,
                    backendValue: backendField.type,
                    type: 'type_mismatch'
                })
            }

            // Verificar required
            if (field.required !== backendField.required) {
                conflicts.push({
                    field: `${fieldType}.${name}.required`,
                    frontendValue: field.required,
                    backendValue: backendField.required,
                    type: 'required_mismatch'
                })
            }
        }
    }

    // Verificar campos que están en backend pero no en frontend
    for (const [name, field] of backendMap) {
        if (!frontendMap.has(name)) {
            conflicts.push({
                field: `${fieldType}.${name}`,
                frontendValue: null,
                backendValue: field,
                type: 'missing'
            })
        }
    }

    return conflicts
}

export function getStatusColor(status: EndpointStatus): string {
    switch (status) {
        case 'synced': return 'bg-green-500'
        case 'conflict': return 'bg-red-500'
        case 'pending': return 'bg-yellow-500'
        case 'undefined': return 'bg-gray-400'
        default: return 'bg-gray-400'
    }
}

export function getStatusIcon(status: EndpointStatus): string {
    switch (status) {
        case 'synced': return '✅'
        case 'conflict': return '❌'
        case 'pending': return '⏳'
        case 'undefined': return '⚪'
        default: return '⚪'
    }
}
