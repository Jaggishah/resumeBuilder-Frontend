import { useState } from 'react'
import { useSaveResumeMutation } from '../../redux/features/api/apiSlice'
import { useAppSelector } from '../../redux/hooks'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  open: boolean
  onClose: () => void
}

export default function SaveResumeDialog({ open, onClose }: Props) {
  const [title, setTitle] = useState('')
  const [saveResume, { isLoading }] = useSaveResumeMutation()
  const resumeState = useAppSelector(state => state.resume)

  const handleSave = async () => {
    const payload = {
      title: title || null,
      json_data: {
        personalInfo: resumeState.personalInfo,
        dynamicSections: resumeState.dynamicSections
      }
    }

    try {
      await saveResume(payload).unwrap()
      console.log('Resume saved successfully:', payload)
      setTitle('') // Reset form
      onClose()
    } catch (err) {
      console.error('Failed to save resume', err)
      // Could show UI error here
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Resume</DialogTitle>
          <DialogDescription>
            Give your resume a title to help you find it later. Leave blank for an untitled resume.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Dave Resume"
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Resume'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
