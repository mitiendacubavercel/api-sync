import { NextRequest, NextResponse } from 'next/server'
import { ProjectService } from '@/lib/services/projectService'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const project = await ProjectService.getProject(params.id)

        if (!project) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        return NextResponse.json(project)
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const success = await ProjectService.deleteProject(params.id)
        
        if (!success) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }
        
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json(
            { error: 'Failed to delete project' },
            { status: 500 }
        )
    }
}