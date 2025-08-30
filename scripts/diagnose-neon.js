// scripts/diagnose-neon.js
require('dotenv').config()
const { Pool } = require('pg')
const net = require('net')
const dns = require('dns').promises

async function diagnoseNeonConnection() {
    console.log('🔍 Diagnóstico completo de conexión a Neon\n')

    const url = process.env.DATABASE_URL
    if (!url) {
        console.log('❌ DATABASE_URL no configurada')
        return
    }

    // Parsear URL
    const urlObj = new URL(url)
    const host = urlObj.hostname
    const port = urlObj.port || 5432
    const database = urlObj.pathname.slice(1)
    const username = urlObj.username

    console.log('📋 Configuración detectada:')
    console.log(`  Host: ${host}`)
    console.log(`  Puerto: ${port}`)
    console.log(`  Base de datos: ${database}`)
    console.log(`  Usuario: ${username}`)
    console.log(`  SSL: ${urlObj.searchParams.get('sslmode')}\n`)

    // 1. Verificar resolución DNS
    console.log('🌐 1. Verificando resolución DNS...')
    try {
        const addresses = await dns.lookup(host)
        console.log(`✅ DNS resuelto: ${addresses.address}`)
    } catch (error) {
        console.log(`❌ Error DNS: ${error.message}`)
        return
    }

    // 2. Verificar conectividad TCP
    console.log('\n🔌 2. Verificando conectividad TCP...')
    const tcpTest = new Promise((resolve, reject) => {
        const socket = new net.Socket()
        const timeout = setTimeout(() => {
            socket.destroy()
            reject(new Error('TCP timeout'))
        }, 10000)

        socket.connect(port, host, () => {
            clearTimeout(timeout)
            socket.destroy()
            resolve('TCP OK')
        })

        socket.on('error', (error) => {
            clearTimeout(timeout)
            reject(error)
        })
    })

    try {
        await tcpTest
        console.log('✅ Conectividad TCP exitosa')
    } catch (error) {
        console.log(`❌ Error TCP: ${error.message}`)
        console.log('\n💡 Posibles causas:')
        console.log('  - Firewall corporativo bloqueando puerto 5432')
        console.log('  - Red corporativa/VPN con restricciones')
        console.log('  - ISP bloqueando conexiones de base de datos')
        return
    }

    // 3. Probar conexión PostgreSQL con diferentes timeouts
    console.log('\n🐘 3. Probando conexión PostgreSQL...')

    const configs = [
        { connectionTimeoutMillis: 60000, statement_timeout: 60000 },
        { connectionTimeoutMillis: 30000, statement_timeout: 30000 },
        { connectionTimeoutMillis: 15000, statement_timeout: 15000 }
    ]

    for (let i = 0; i < configs.length; i++) {
        const config = configs[i]
        console.log(`\n🔄 Intento ${i + 1} (timeout: ${config.connectionTimeoutMillis}ms)`)

        const pool = new Pool({
            connectionString: url,
            ssl: { rejectUnauthorized: false },
            max: 1,
            ...config
        })

        try {
            const client = await pool.connect()
            console.log('✅ ¡Conexión PostgreSQL exitosa!')

            const result = await client.query('SELECT NOW() as time')
            console.log('📅 Tiempo servidor:', result.rows[0].time)

            client.release()
            await pool.end()
            return // Éxito, salir

        } catch (error) {
            console.log(`❌ Falló: ${error.message}`)
            await pool.end()
        }
    }

    // 4. Probar sin SSL
    console.log('\n🔓 4. Probando sin SSL...')
    const noSslUrl = url.replace('?sslmode=require', '').replace('&sslmode=require', '')

    const poolNoSsl = new Pool({
        connectionString: noSslUrl,
        ssl: false,
        connectionTimeoutMillis: 30000,
        max: 1
    })

    try {
        const client = await poolNoSsl.connect()
        console.log('✅ Conexión sin SSL exitosa')
        client.release()
        await poolNoSsl.end()
    } catch (error) {
        console.log(`❌ Sin SSL también falló: ${error.message}`)
        await poolNoSsl.end()
    }

    console.log('\n🚨 Todas las pruebas fallaron')
    console.log('\n💡 Soluciones recomendadas:')
    console.log('1. Verificar si estás en una red corporativa con firewall')
    console.log('2. Probar desde otra red (hotspot móvil)')
    console.log('3. Contactar administrador de red si estás en empresa')
    console.log('4. Verificar estado de Neon: https://neon.tech/status')
    console.log('5. Probar conexión desde Vercel (donde funciona)')
}

diagnoseNeonConnection()
