// test-db.js
require('dotenv').config()
const { Pool } = require('pg')

console.log('🔍 Variables de entorno cargadas:')
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'CONFIGURADA ✅' : 'NO ENCONTRADA ❌')

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Necesario para Neon
    },
    max: 20,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000, // Aumentado para conexiones remotas
    acquireTimeoutMillis: 60000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 0,
    statement_timeout: 30000,
    query_timeout: 30000,
})

async function testConnection() {
    try {
        console.log('🌐 Intentando conectar a Neon Database...')
        const client = await pool.connect()
        console.log('✅ Conexión establecida exitosamente con Neon!')

        // Información básica
        const result = await client.query('SELECT NOW() as current_time, version() as pg_version')
        console.log('📅 Tiempo actual:', result.rows[0].current_time)
        console.log('🐘 Versión PostgreSQL:', result.rows[0].pg_version.split(' ')[0])

        // Verificar tablas existentes
        const tablesResult = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `)

        console.log('\n📋 Tablas en la base de datos:')
        if (tablesResult.rows.length > 0) {
            tablesResult.rows.forEach(row => {
                console.log(`  - ${row.table_name}`)
            })
        } else {
            console.log('  (No hay tablas en el esquema público)')
        }

        // Prueba consulta a projects si existe
        try {
            const projectsResult = await client.query('SELECT COUNT(*) as total FROM projects')
            console.log('\n📊 Total de proyectos:', projectsResult.rows[0].total)

            // Mostrar algunos proyectos de ejemplo
            const sampleProjects = await client.query('SELECT id, name, created_at FROM projects LIMIT 3')
            if (sampleProjects.rows.length > 0) {
                console.log('\n🔍 Proyectos de ejemplo:')
                sampleProjects.rows.forEach(project => {
                    console.log(`  - ID: ${project.id}, Nombre: ${project.name}, Creado: ${project.created_at}`)
                })
            }
        } catch (error) {
            console.log('\n⚠️ Tabla projects no existe:', error.message)
        }

        client.release()
        console.log('\n✅ Conexión liberada correctamente')

    } catch (error) {
        console.error('\n❌ Error de conexión:', error.message)
        console.error('Código de error:', error.code)

        if (error.code === 'ENOTFOUND') {
            console.error('🌐 No se puede resolver el hostname de Neon')
        } else if (error.code === 'ECONNREFUSED') {
            console.error('🚫 Conexión rechazada por el servidor')
        } else if (error.code === '28P01') {
            console.error('🔐 Error de autenticación - verifica usuario/contraseña')
        }

    } finally {
        await pool.end()
        console.log('🔚 Pool cerrado')
    }
}

testConnection()
