import { NextRequest, NextResponse } from 'next/server'
import { EndpointService } from '@/lib/services/endpointService'

export async function POST(request: NextRequest) {
    try {
        const { projectId, path, method } = await request.json()

        if (!projectId || !path || !method) {
            return NextResponse.json(
                { error: 'Project ID, path, and method are required' },
                { status: 400 }
            )
        }

        const endpoint = await EndpointService.createEndpoint(projectId, path, method)
        return NextResponse.json(endpoint, { status: 201 })
    } catch (error) {
        console.error('Error creating endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to create endpoint' },
            { status: 500 }
        )
    }
}
