'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types'

export function useProject(projectId: string) {
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadProject()
    }, [projectId])

    const loadProject = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/projects/${projectId}`)
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const projectData = await response.json()
            setProject(projectData)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error loading project')
            console.error('Error loading project:', err)
        } finally {
            setLoading(false)
        }
    }

    const refreshProject = () => {
        loadProject()
    }

    return {
        project,
        loading,
        error,
        refreshProject,
        setProject
    }
}
