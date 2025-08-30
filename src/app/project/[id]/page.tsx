import { ProjectDashboard } from '@/components/project-dashboard'

interface ProjectPageProps {
    params: {
        id: string
    }
}

export default function ProjectPage({ params }: ProjectPageProps) {
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <ProjectDashboard projectId={params.id} />
            </div>
        </div>
    )
}
