const { Pool } = require('pg')
require('dotenv').config({ path: '.env.local' })

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

const resetDatabase = async () => {
    const client = await pool.connect()

    try {
        console.log('🗑️  Eliminando tablas existentes...')

        await client.query('DROP TABLE IF EXISTS endpoints CASCADE;')
        await client.query('DROP TABLE IF EXISTS projects CASCADE;')
        await client.query('DROP TABLE IF EXISTS users CASCADE;')

        console.log('✅ Tablas eliminadas')
        console.log('🔄 Recreando tablas...')

        // Recrear tablas
        await client.query(`
      CREATE TABLE projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `)

        await client.query(`
      CREATE TABLE endpoints (
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
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(20) DEFAULT 'fullstack',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `)

        // Crear índices
        await client.query('CREATE INDEX idx_endpoints_project_id ON endpoints(project_id);')
        await client.query('CREATE INDEX idx_endpoints_status ON endpoints(status);')

        console.log('✅ Base de datos reseteada correctamente')

    } catch (error) {
        console.error('❌ Error reseteando base de datos:', error)
    } finally {
        client.release()
        await pool.end()
    }
}

resetDatabase()
