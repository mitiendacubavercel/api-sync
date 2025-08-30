import { EndpointSpec, FieldSpec, HTTPMethod } from '@/types'

export function validateEndpointPath(path: string): boolean {
    if (!path || typeof path !== 'string') return false
    if (!path.startsWith('/')) return false
    if (path.length > 500) return false
    return true
}

export function validateHTTPMethod(method: string): method is HTTPMethod {
    return ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(method)
}

export function validateFieldSpec(field: FieldSpec): boolean {
    if (!field.name || typeof field.name !== 'string') return false
    if (!['string', 'number', 'boolean', 'object', 'array'].includes(field.type)) return false
    if (typeof field.required !== 'boolean') return false
    return true
}

export function validateEndpointSpec(spec: EndpointSpec): boolean {
    if (spec.parameters && !Array.isArray(spec.parameters)) return false
    if (spec.requestBody && !Array.isArray(spec.requestBody)) return false
    if (spec.responseBody && !Array.isArray(spec.responseBody)) return false
    if (spec.headers && !Array.isArray(spec.headers)) return false
    if (spec.statusCodes && !Array.isArray(spec.statusCodes)) return false

    // Validar cada campo si existe
    if (spec.parameters && !spec.parameters.every(validateFieldSpec)) return false
    if (spec.requestBody && !spec.requestBody.every(validateFieldSpec)) return false
    if (spec.responseBody && !spec.responseBody.every(validateFieldSpec)) return false
    if (spec.headers && !spec.headers.every(validateFieldSpec)) return false

    // Validar status codes
    if (spec.statusCodes && !spec.statusCodes.every(code =>
        Number.isInteger(code) && code >= 100 && code < 600
    )) return false

    return true
}
