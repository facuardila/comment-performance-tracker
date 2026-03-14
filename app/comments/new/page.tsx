'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

interface FormData {
  url: string
  cmName: string
  campaignTag: string
  targetAccount: string
  notes: string
}

export default function QuickAddPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<FormData>({
    url: '',
    cmName: typeof window !== 'undefined' ? localStorage.getItem('cmName') || '' : '',
    campaignTag: typeof window !== 'undefined' ? localStorage.getItem('campaignTag') || '' : '',
    targetAccount: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar URL
      if (!isValidUrl(formData.url)) {
        toast.error('Please enter a valid Instagram URL')
        return
      }

      // Guardar en localStorage los valores frecuentes
      localStorage.setItem('cmName', formData.cmName)
      localStorage.setItem('campaignTag', formData.campaignTag)

      // Simular envío al backend
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source_url: formData.url,
          cm_name: formData.cmName,
          campaign_tag: formData.campaignTag,
          target_account: formData.targetAccount,
          notes: formData.notes,
          platform: 'instagram'
        }),
      })

      if (response.ok) {
        toast.success('Comment added successfully!')
        
        // Resetear formulario si no se hizo clic en "Save and add another"
        if (!(e.nativeEvent instanceof SubmitEvent && e.nativeEvent.submitter?.id === 'save-add-another')) {
          setFormData({
            url: '',
            cmName: formData.cmName,
            campaignTag: formData.campaignTag,
            targetAccount: '',
            notes: ''
          })
        }
      } else {
        const errorData = await response.json()
        toast.error(errorData.message || 'Failed to add comment')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      toast.error('An error occurred while adding the comment')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveAndAddAnother = (e: React.FormEvent) => {
    // Este manejador permite distinguir entre "Submit" y "Save and add another"
    e.preventDefault()
    
    // Simular envío normal
    const submitEvent = new SubmitEvent('submit', { bubbles: true, cancelable: true })
    Object.defineProperty(submitEvent, 'submitter', {
      value: { id: 'save-add-another' },
      writable: false
    })
    
    handleSubmit(submitEvent).then(() => {
      // Limpiar solo el campo URL para el siguiente comentario
      setFormData(prev => ({
        ...prev,
        url: '',
        targetAccount: '',
        notes: ''
      }))
    })
  }

  const isValidUrl = (urlString: string) => {
    try {
      const url = new URL(urlString)
      return url.hostname.includes('instagram.com')
    } catch (err) {
      return false
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Quick Add Comment</CardTitle>
            <CardDescription>Add a new Instagram comment to track</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="url">Instagram URL *</Label>
                  <Input
                    id="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="https://www.instagram.com/p/..."
                    required
                    autoFocus
                  />
                  <p className="mt-1 text-sm text-gray-500">Paste the link to the comment or post</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cmName">CM Name *</Label>
                    <Input
                      id="cmName"
                      name="cmName"
                      value={formData.cmName}
                      onChange={handleChange}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="campaignTag">Campaign Tag *</Label>
                    <Input
                      id="campaignTag"
                      name="campaignTag"
                      value={formData.campaignTag}
                      onChange={handleChange}
                      placeholder="#CampaignName"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="targetAccount">Target Account</Label>
                  <Input
                    id="targetAccount"
                    name="targetAccount"
                    value={formData.targetAccount}
                    onChange={handleChange}
                    placeholder="@account_name"
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Any additional notes..."
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Adding...' : 'Add Comment'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleSaveAndAddAnother}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Save & Add Another
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Mostrar últimos comentarios añadidos */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Recently Added</CardTitle>
            <CardDescription>Your latest tracked comments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <p>No recent comments yet. Add your first comment above!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}