import { NextRequest, NextResponse } from 'next/server'
import { ProjectService } from '@/lib/services/projectService'

export async function GET() {
    try {
        const projects = await ProjectService.getAllProjects()
        return NextResponse.json(projects)
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, description } = await request.json()

        if (!name) {
            return NextResponse.json(
                { error: 'Project name is required' },
                { status: 400 }
            )
        }

        const project = await ProjectService.createProject(name, description)
        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        )
    }
}
