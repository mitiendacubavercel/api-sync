import pool from '@/lib/db'
import { Endpoint, EndpointSpec, HTTPMethod } from '@/types'
import { compareSpecs } from '@/lib/comparison'

export class EndpointService {
    static async createEndpoint(
        projectId: string,
        path: string,
        method: HTTPMethod
    ): Promise<Endpoint> {
        const client = await pool.connect()
        try {
            const result = await client.query(
                `INSERT INTO endpoints (project_id, path, method, frontend_spec, backend_spec, status) 
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
                [projectId, path, method, {}, {}, 'undefined']
            )

            const row = result.rows[0]
            return {
                id: row.id,
                path: row.path,
                method: row.method,
                frontendSpec: row.frontend_spec,
                backendSpec: row.backend_spec,
                status: row.status,
                conflicts: row.conflicts,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }
        } finally {
            client.release()
        }
    }

    static async updateEndpointSpec(
        endpointId: string,
        spec: EndpointSpec,
        specType: 'frontend' | 'backend'
    ): Promise<Endpoint> {
        const client = await pool.connect()
        try {
            // Primero obtener el endpoint actual
            const currentResult = await client.query(
                'SELECT * FROM endpoints WHERE id = $1',
                [endpointId]
            )

            if (currentResult.rows.length === 0) {
                throw new Error('Endpoint not found')
            }

            const current = currentResult.rows[0]
            const frontendSpec = specType === 'frontend' ? spec : current.frontend_spec
            const backendSpec = specType === 'backend' ? spec : current.backend_spec

            // Comparar specs y actualizar status
            const comparison = compareSpecs(frontendSpec, backendSpec)

            const updateField = specType === 'frontend' ? 'frontend_spec' : 'backend_spec'
            const result = await client.query(
                `UPDATE endpoints 
         SET ${updateField} = $1, status = $2, conflicts = $3, updated_at = NOW()
         WHERE id = $4 RETURNING *`,
                [spec, comparison.status, JSON.stringify(comparison.conflicts), endpointId]
            )

            const row = result.rows[0]
            return {
                id: row.id,
                path: row.path,
                method: row.method,
                frontendSpec: row.frontend_spec,
                backendSpec: row.backend_spec,
                status: row.status,
                conflicts: row.conflicts,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }
        } finally {
            client.release()
        }
    }

    static async deleteEndpoint(endpointId: string): Promise<void> {
        const client = await pool.connect()
        try {
            await client.query('DELETE FROM endpoints WHERE id = $1', [endpointId])
        } finally {
            client.release()
        }
    }
}
