'use client'

import { useState } from 'react'
import { Endpoint, HTTPMethod } from '@/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { EndpointEditor } from './endpoint-editor'
import { Trash2, Edit, AlertTriangle } from 'lucide-react'

interface EndpointCardProps {
    endpoint: Endpoint
    onUpdate: (endpoint: Endpoint) => void
    onDelete: (endpointId: string) => void
}

const methodColors: Record<HTTPMethod, string> = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    DELETE: 'bg-red-100 text-red-800',
    PATCH: 'bg-purple-100 text-purple-800'
}

export function EndpointCard({ endpoint, onUpdate, onDelete }: EndpointCardProps) {
    const [isEditing, setIsEditing] = useState(false)

    const hasConflicts = endpoint.conflicts && endpoint.conflicts.length > 0

    return (
        <Card className="h-full hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">
                            {endpoint.path}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                            <Badge className={methodColors[endpoint.method]}>
                                {endpoint.method}
                            </Badge>
                            <StatusBadge status={endpoint.status} />
                        </div>
                    </div>
                    <div className="flex gap-1 ml-2">
                        <Dialog open={isEditing} onOpenChange={setIsEditing}>
                            <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>
                                        Editar Endpoint: {endpoint.method} {endpoint.path}
                                    </DialogTitle>
                                </DialogHeader>
                                <EndpointEditor
                                    endpoint={endpoint}
                                    onSave={(updated) => {
                                        onUpdate(updated)
                                        setIsEditing(false)
                                    }}
                                    onCancel={() => setIsEditing(false)}
                                />
                            </DialogContent>
                        </Dialog>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(endpoint.id)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                        <span className="text-gray-500">Frontend:</span>
                        <span className={endpoint.frontendSpec.definedBy ? 'text-green-600' : 'text-gray-400'}>
                            {endpoint.frontendSpec.definedBy ? '✓ Definido' : 'Sin definir'}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-gray-500">Backend:</span>
                        <span className={endpoint.backendSpec.definedBy ? 'text-green-600' : 'text-gray-400'}>
                            {endpoint.backendSpec.definedBy ? '✓ Definido' : 'Sin definir'}
                        </span>
                    </div>

                    {hasConflicts && (
                        <div className="flex items-center gap-1 text-red-600 mt-2">
                            <AlertTriangle className="h-3 w-3" />
                            <span>{endpoint.conflicts!.length} conflicto(s)</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
