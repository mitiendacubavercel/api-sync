import { NextRequest, NextResponse } from 'next/server'
import { EndpointService } from '@/lib/services/endpointService'

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { spec, specType } = await request.json()

        if (!spec || !specType || !['frontend', 'backend'].includes(specType)) {
            return NextResponse.json(
                { error: 'Valid spec and specType (frontend/backend) are required' },
                { status: 400 }
            )
        }

        const endpoint = await EndpointService.updateEndpointSpec(
            params.id,
            spec,
            specType
        )

        return NextResponse.json(endpoint)
    } catch (error) {
        console.error('Error updating endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to update endpoint' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await EndpointService.deleteEndpoint(params.id)
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting endpoint:', error)
        return NextResponse.json(
            { error: 'Failed to delete endpoint' },
            { status: 500 }
        )
    }
}
