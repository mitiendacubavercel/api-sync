'use client'

import { useState, useEffect } from 'react'
import { Project, Endpoint, HTTPMethod } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EndpointCard } from './endpoint-card'
import { Plus, Download, Upload, Trash2, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface ProjectDashboardProps {
    projectId: string
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
    const router = useRouter()
    const [project, setProject] = useState<Project | null>(null)
    const [loading, setLoading] = useState(true)
    const [isAddingEndpoint, setIsAddingEndpoint] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [newEndpoint, setNewEndpoint] = useState({
        path: '',
        method: 'GET' as HTTPMethod
    })

    useEffect(() => {
        loadProject()
    }, [projectId])

    const loadProject = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}`)
            if (!response.ok) throw new Error('Failed to load project')
            const projectData = await response.json()
            setProject(projectData)
        } catch (error) {
            console.error('Error loading project:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddEndpoint = async () => {
        if (!newEndpoint.path.trim()) return

        try {
            const response = await fetch('/api/endpoints', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    path: newEndpoint.path,
                    method: newEndpoint.method
                })
            })

            if (!response.ok) throw new Error('Failed to create endpoint')

            const endpoint = await response.json()
            setProject(prev => prev ? {
                ...prev,
                endpoints: [...prev.endpoints, endpoint]
            } : null)

            setNewEndpoint({ path: '', method: 'GET' })
            setIsAddingEndpoint(false)
        } catch (error) {
            console.error('Error creating endpoint:', error)
        }
    }

    const handleUpdateEndpoint = (updatedEndpoint: Endpoint) => {
        setProject(prev => prev ? {
            ...prev,
            endpoints: prev.endpoints.map(ep =>
                ep.id === updatedEndpoint.id ? updatedEndpoint : ep
            )
        } : null)
    }

    const handleDeleteEndpoint = async (endpointId: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar este endpoint?')) return

        try {
            const response = await fetch(`/api/endpoints/${endpointId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete endpoint')

            setProject(prev => prev ? {
                ...prev,
                endpoints: prev.endpoints.filter(ep => ep.id !== endpointId)
            } : null)
        } catch (error) {
            console.error('Error deleting endpoint:', error)
        }
    }

    const handleDeleteProject = async () => {
        try {
            const response = await fetch(`/api/projects/${projectId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Failed to delete project')
            
            router.push('/')
        } catch (error) {
            console.error('Error deleting project:', error)
        }
    }
    const getStatusStats = () => {
        if (!project) return { synced: 0, conflict: 0, pending: 0, undefined: 0 }

        return project.endpoints.reduce((acc, endpoint) => {
            acc[endpoint.status]++
            return acc
        }, { synced: 0, conflict: 0, pending: 0, undefined: 0 })
    }

    const exportProject = () => {
        if (!project) return

        const dataStr = JSON.stringify(project, null, 2)
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

        const exportFileDefaultName = `${project.name.replace(/\s+/g, '_')}_api_spec.json`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()
    }

    if (loading) {
        return <div className="flex justify-center items-center h-64">Cargando...</div>
    }

    if (!project) {
        return <div className="text-center text-red-600">Proyecto no encontrado</div>
    }

    const stats = getStatusStats()

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{project.name}</h1>
                    {project.description && (
                        <p className="text-gray-600 mt-1">{project.description}</p>
                    )}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={exportProject}>
                        <Download className="h-4 w-4 mr-2" />
                        Exportar
                    </Button>
                    <Button variant="outline" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setIsDeleting(true)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Proyecto
                    </Button>
                    <Dialog open={isAddingEndpoint} onOpenChange={setIsAddingEndpoint}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Nuevo Endpoint
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Crear Nuevo Endpoint</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="path">Ruta del Endpoint</Label>
                                    <Input
                                        id="path"
                                        value={newEndpoint.path}
                                        onChange={(e) => setNewEndpoint(prev => ({ ...prev, path: e.target.value }))}
                                        placeholder="/api/users"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="method">Método HTTP</Label>
                                    <Select
                                        value={newEndpoint.method}
                                        onValueChange={(value: HTTPMethod) => setNewEndpoint(prev => ({ ...prev, method: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="GET">GET</SelectItem>
                                            <SelectItem value="POST">POST</SelectItem>
                                            <SelectItem value="PUT">PUT</SelectItem>
                                            <SelectItem value="DELETE">DELETE</SelectItem>
                                            <SelectItem value="PATCH">PATCH</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={handleAddEndpoint} className="flex-1">
                                        Crear Endpoint
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddingEndpoint(false)}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Delete Project Confirmation Dialog */}
            <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Confirmar eliminación
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p>¿Estás seguro de que quieres eliminar el proyecto <strong>{project.name}</strong>? Esta acción no se puede deshacer y se eliminarán todos los endpoints asociados.</p>
                        <div className="flex gap-2">
                            <Button 
                                variant="destructive" 
                                onClick={handleDeleteProject}
                                className="flex-1"
                            >
                                Eliminar Proyecto
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsDeleting(false)}
                                className="flex-1"
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                                <div className="text-2xl font-bold">{stats.synced}</div>
                                <div className="text-sm text-gray-600">Sincronizados</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <div>
                                <div className="text-2xl font-bold">{stats.conflict}</div>
                                <div className="text-sm text-gray-600">Con Conflictos</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <div>
                                <div className="text-2xl font-bold">{stats.pending}</div>
                                <div className="text-sm text-gray-600">Pendientes</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                            <div>
                                <div className="text-2xl font-bold">{stats.undefined}</div>
                                <div className="text-sm text-gray-600">Sin Definir</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Endpoints Grid */}
            <div>
                <h2 className="text-xl font-semibold mb-4">Endpoints ({project.endpoints.length})</h2>
                {project.endpoints.length === 0 ? (
                    <Card>
                        <CardContent className="p-8 text-center">
                            <p className="text-gray-500 mb-4">No hay endpoints definidos aún</p>
                            <Button onClick={() => setIsAddingEndpoint(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Crear tu primer endpoint
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {project.endpoints.map((endpoint) => (
                            <EndpointCard
                                key={endpoint.id}
                                endpoint={endpoint}
                                onUpdate={handleUpdateEndpoint}
                                onDelete={handleDeleteEndpoint}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
