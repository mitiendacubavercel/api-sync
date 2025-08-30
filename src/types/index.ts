export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export type EndpointStatus = 'synced' | 'conflict' | 'pending' | 'undefined'

export interface FieldSpec {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description?: string
}

export interface EndpointSpec {
  parameters?: FieldSpec[]
  requestBody?: FieldSpec[]
  responseBody?: FieldSpec[]
  headers?: FieldSpec[]
  statusCodes?: number[]
  description?: string
  definedBy?: 'frontend' | 'backend'
}

export interface Conflict {
  field: string
  frontendValue: any
  backendValue: any
  type: 'missing' | 'type_mismatch' | 'required_mismatch'
}

export interface Endpoint {
  id: string
  path: string
  method: HTTPMethod
  frontendSpec: EndpointSpec
  backendSpec: EndpointSpec
  status: EndpointStatus
  conflicts?: Conflict[]
  createdAt: Date
  updatedAt: Date
}

export interface Project {
  id: string
  name: string
  description?: string
  createdAt: Date
  updatedAt: Date
  endpoints: Endpoint[]
}

export interface User {
  id: string
  name: string
  email: string
  role: 'frontend' | 'backend' | 'fullstack'
}
