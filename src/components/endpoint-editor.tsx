'use client'

import { useState } from 'react'
import { Endpoint, EndpointSpec, FieldSpec, HTTPMethod } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

interface EndpointEditorProps {
    endpoint: Endpoint
    onSave: (endpoint: Endpoint) => void
    onCancel: () => void
}

export function EndpointEditor({ endpoint, onSave, onCancel }: EndpointEditorProps) {
    const [frontendSpec, setFrontendSpec] = useState<EndpointSpec>({
        ...endpoint.frontendSpec,
        definedBy: endpoint.frontendSpec.definedBy || 'frontend'
    })
    const [backendSpec, setBackendSpec] = useState<EndpointSpec>({
        ...endpoint.backendSpec,
        definedBy: endpoint.backendSpec.definedBy || 'backend'
    })
    const [loading, setLoading] = useState(false)

    const handleSave = async (specType: 'frontend' | 'backend') => {
        setLoading(true)
        try {
            const spec = specType === 'frontend' ? frontendSpec : backendSpec
            const response = await fetch(`/api/endpoints/${endpoint.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ spec, specType })
            })

            if (!response.ok) throw new Error('Failed to update endpoint')

            const updatedEndpoint = await response.json()
            onSave(updatedEndpoint)
        } catch (error) {
            console.error('Error updating endpoint:', error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-4">
            <Tabs defaultValue="frontend" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="frontend">Vista Frontend</TabsTrigger>
                    <TabsTrigger value="backend">Vista Backend</TabsTrigger>
                </TabsList>

                <TabsContent value="frontend" className="space-y-4">
                    <SpecEditor
                        spec={frontendSpec}
                        onChange={setFrontendSpec}
                        title="Especificación Frontend"
                        description="Define lo que el frontend necesita recibir"
                    />
                    <Button
                        onClick={() => handleSave('frontend')}
                        disabled={loading}
                        className="w-full"
                    >
                        Guardar Especificación Frontend
                    </Button>
                </TabsContent>

                <TabsContent value="backend" className="space-y-4">
                    <SpecEditor
                        spec={backendSpec}
                        onChange={setBackendSpec}
                        title="Especificación Backend"
                        description="Define lo que el backend puede entregar"
                    />
                    <Button
                        onClick={() => handleSave('backend')}
                        disabled={loading}
                        className="w-full"
                    >
                        Guardar Especificación Backend
                    </Button>
                </TabsContent>
            </Tabs>

            {endpoint.conflicts && endpoint.conflicts.length > 0 && (
                <Card className="border-red-200 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-800 text-sm">Conflictos Detectados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {endpoint.conflicts.map((conflict, index) => (
                                <div key={index} className="text-sm">
                                    <div className="font-medium text-red-700">{conflict.field}</div>
                                    <div className="text-red-600">
                                        Frontend: {JSON.stringify(conflict.frontendValue)} |
                                        Backend: {JSON.stringify(conflict.backendValue)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="flex gap-2">
                <Button variant="outline" onClick={onCancel} className="flex-1">
                    Cancelar
                </Button>
            </div>
        </div>
    )
}

interface SpecEditorProps {
    spec: EndpointSpec
    onChange: (spec: EndpointSpec) => void
    title: string
    description: string
}

function SpecEditor({ spec, onChange, title, description }: SpecEditorProps) {
    const addField = (fieldType: keyof EndpointSpec) => {
        const newField: FieldSpec = {
            name: '',
            type: 'string',
            required: false,
            description: ''
        }

        const currentFields = spec[fieldType] as FieldSpec[] || []
        onChange({
            ...spec,
            [fieldType]: [...currentFields, newField]
        })
    }

    const updateField = (fieldType: keyof EndpointSpec, index: number, field: FieldSpec) => {
        const fields = [...(spec[fieldType] as FieldSpec[] || [])]
        fields[index] = field
        onChange({ ...spec, [fieldType]: fields })
    }

    const removeField = (fieldType: keyof EndpointSpec, index: number) => {
        const fields = [...(spec[fieldType] as FieldSpec[] || [])]
        fields.splice(index, 1)
        onChange({ ...spec, [fieldType]: fields })
    }

    const updateStatusCodes = (codes: string) => {
        const statusCodes = codes.split(',').map(c => parseInt(c.trim())).filter(c => !isNaN(c))
        onChange({ ...spec, statusCodes })
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
                <p className="text-sm text-gray-600">{description}</p>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                        id="description"
                        value={spec.description || ''}
                        onChange={(e) => onChange({ ...spec, description: e.target.value })}
                        placeholder="Describe este endpoint..."
                    />
                </div>

                <FieldSection
                    title="Parámetros"
                    fields={spec.parameters || []}
                    onAdd={() => addField('parameters')}
                    onUpdate={(index, field) => updateField('parameters', index, field)}
                    onRemove={(index) => removeField('parameters', index)}
                />

                <FieldSection
                    title="Request Body"
                    fields={spec.requestBody || []}
                    onAdd={() => addField('requestBody')}
                    onUpdate={(index, field) => updateField('requestBody', index, field)}
                    onRemove={(index) => removeField('requestBody', index)}
                />

                <FieldSection
                    title="Response Body"
                    fields={spec.responseBody || []}
                    onAdd={() => addField('responseBody')}
                    onUpdate={(index, field) => updateField('responseBody', index, field)}
                    onRemove={(index) => removeField('responseBody', index)}
                />

                <div>
                    <Label htmlFor="statusCodes">Códigos de Estado (separados por coma)</Label>
                    <Input
                        id="statusCodes"
                        value={(spec.statusCodes || []).join(', ')}
                        onChange={(e) => updateStatusCodes(e.target.value)}
                        placeholder="200, 400, 404, 500"
                    />
                </div>
            </CardContent>
        </Card>
    )
}

interface FieldSectionProps {
    title: string
    fields: FieldSpec[]
    onAdd: () => void
    onUpdate: (index: number, field: FieldSpec) => void
    onRemove: (index: number) => void
}

function FieldSection({ title, fields, onAdd, onUpdate, onRemove }: FieldSectionProps) {
    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-medium">{title}</Label>
                <Button type="button" variant="outline" size="sm" onClick={onAdd}>
                    <Plus className="h-4 w-4 mr-1" />
                    Agregar Campo
                </Button>
            </div>

            <div className="space-y-3">
                {fields.map((field, index) => (
                    <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                            <Input
                                placeholder="Nombre del campo"
                                value={field.name}
                                onChange={(e) => onUpdate(index, { ...field, name: e.target.value })}
                            />
                        </div>
                        <div className="w-32">
                            <Select
                                value={field.type}
                                onValueChange={(value: any) => onUpdate(index, { ...field, type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="string">String</SelectItem>
                                    <SelectItem value="number">Number</SelectItem>
                                    <SelectItem value="boolean">Boolean</SelectItem>
                                    <SelectItem value="object">Object</SelectItem>
                                    <SelectItem value="array">Array</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-24">
                            <Select
                                value={field.required ? 'required' : 'optional'}
                                onValueChange={(value) => onUpdate(index, { ...field, required: value === 'required' })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="required">Requerido</SelectItem>
                                    <SelectItem value="optional">Opcional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(index)}
                            className="text-red-600 hover:text-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                {fields.length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-4">
                        No hay campos definidos. Haz clic en "Agregar Campo" para empezar.
                    </p>
                )}
            </div>
        </div>
    )
}
