'use client'

import { useState, useEffect } from 'react'
import { Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Calendar, ArrowRight, Trash2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null)
  const [newProject, setNewProject] = useState({
    name: '',
    description: ''
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (!response.ok) throw new Error('Failed to load projects')
      const projectsData = await response.json()
      setProjects(projectsData)
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProject)
      })

      if (!response.ok) throw new Error('Failed to create project')

      const project = await response.json()
      setProjects(prev => [project, ...prev])
      setNewProject({ name: '', description: '' })
      setIsCreating(false)
    } catch (error) {
      console.error('Error creating project:', error)
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete project')

      setProjects(prev => prev.filter(project => project.id !== projectId))
      setIsDeletingId(null)
    } catch (error) {
      console.error('Error deleting project:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando proyectos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                API Sync Board
              </h1>
              <p className="text-gray-600 mt-2">
                Sincroniza las especificaciones entre Frontend y Backend
              </p>
            </div>
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Nuevo Proyecto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Crear Nuevo Proyecto</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="projectName">Nombre del Proyecto</Label>
                    <Input
                      id="projectName"
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Mi API Project"
                    />
                  </div>
                  <div>
                    <Label htmlFor="projectDescription">Descripción (opcional)</Label>
                    <Textarea
                      id="projectDescription"
                      value={newProject.description}
                      onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe tu proyecto..."
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleCreateProject} className="flex-1">
                      Crear Proyecto
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
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

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!isDeletingId} onOpenChange={(open) => !open && setIsDeletingId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Confirmar eliminación
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer y se eliminarán todos los endpoints asociados.</p>
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => isDeletingId && handleDeleteProject(isDeletingId)}
                  className="flex-1"
                >
                  Eliminar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsDeletingId(null)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Projects */}
        {projects.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="max-w-md mx-auto">
                <div className="text-6xl mb-4">🚀</div>
                <h3 className="text-xl font-semibold mb-2">¡Comienza tu primer proyecto!</h3>
                <p className="text-gray-600 mb-6">
                  Crea un proyecto para empezar a sincronizar las especificaciones de tu API
                  entre el equipo de frontend y backend.
                </p>
                <Button onClick={() => setIsCreating(true)} size="lg">
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Proyecto
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="truncate">{project.name}</CardTitle>
                </CardHeader>
                <Link href={`/project/${project.id}`}>
                  <CardContent className="cursor-pointer">
                    {project.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </div>
                      <div>
                        {project.endpoints?.length || 0} endpoints
                      </div>
                      <ArrowRight className="h-4 w-4 ml-auto text-gray-400" />
                    </div>
                  </CardContent>
                </Link>
                <CardFooter className="pt-0 pb-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-auto"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsDeletingId(project.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}