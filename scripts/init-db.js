const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

const initDatabase = async () => {
    const client = await pool.connect()

    try {
        console.log('Inicializando base de datos...')

        // Crear tablas
        await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)

        await client.query(`
      CREATE TABLE IF NOT EXISTS endpoints (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        path VARCHAR(500) NOT NULL,
        method VARCHAR(10) NOT NULL,
        frontend_spec JSONB DEFAULT '{}',
        backend_spec JSONB DEFAULT '{}',
        status VARCHAR(20) DEFAULT 'undefined',
        conflicts JSONB DEFAULT '[]',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)

        await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(20) DEFAULT 'fullstack',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)

        // Crear índices
        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_endpoints_project_id ON endpoints(project_id);
    `)

        await client.query(`
      CREATE INDEX IF NOT EXISTS idx_endpoints_status ON endpoints(status);
    `)

        console.log('✅ Base de datos inicializada correctamente')

    } catch (error) {
        console.error('❌ Error inicializando base de datos:', error)
    } finally {
        client.release()
        await pool.end()
    }
}

initDatabase()
