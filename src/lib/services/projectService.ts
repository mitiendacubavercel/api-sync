import pool from '@/lib/db'
import { Project, Endpoint } from '@/types'
import { v4 as uuidv4 } from 'uuid'

export class ProjectService {
    static async createProject(name: string, description?: string): Promise<Project> {
        const client = await pool.connect()
        try {
            const result = await client.query(
                'INSERT INTO projects (name, description) VALUES ($1, $2) RETURNING *',
                [name, description]
            )

            return {
                id: result.rows[0].id,
                name: result.rows[0].name,
                description: result.rows[0].description,
                createdAt: result.rows[0].created_at,
                updatedAt: result.rows[0].updated_at,
                endpoints: []
            }
        } finally {
            client.release()
        }
    }

    static async getProject(id: string): Promise<Project | null> {
        const client = await pool.connect()
        try {
            const projectResult = await client.query(
                'SELECT * FROM projects WHERE id = $1',
                [id]
            )

            if (projectResult.rows.length === 0) return null

            const endpointsResult = await client.query(
                'SELECT * FROM endpoints WHERE project_id = $1 ORDER BY created_at DESC',
                [id]
            )

            const project = projectResult.rows[0]
            const endpoints = endpointsResult.rows.map(row => ({
                id: row.id,
                path: row.path,
                method: row.method,
                frontendSpec: row.frontend_spec,
                backendSpec: row.backend_spec,
                status: row.status,
                conflicts: row.conflicts,
                createdAt: row.created_at,
                updatedAt: row.updated_at
            }))

            return {
                id: project.id,
                name: project.name,
                description: project.description,
                createdAt: project.created_at,
                updatedAt: project.updated_at,
                endpoints
            }
        } finally {
            client.release()
        }
    }

    static async getAllProjects(): Promise<Project[]> {
        const client = await pool.connect()
        try {
            const result = await client.query(
                'SELECT * FROM projects ORDER BY updated_at DESC'
            )

            return result.rows.map(row => ({
                id: row.id,
                name: row.name,
                description: row.description,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                endpoints: []
            }))
        } finally {
            client.release()
        }
    }
}
