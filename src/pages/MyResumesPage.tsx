import { useGetMyResumesQuery } from '../../redux/features/api/apiSlice'
import { useAppDispatch } from '../../redux/hooks'
import { updateSections, updatePersonalInfo } from '../../redux/features/resumeSlice'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SEO } from '../components/SEO'

export default function MyResumesPage() {
  const { data: resumes, isLoading, error } = useGetMyResumesQuery()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleOpen = (resume: any) => {
    // Assume resume.json_data contains personalInfo and dynamicSections
    console.log('Opening resume:', resume)
    if (resume?.json_data) {
      const { personalInfo, dynamicSections } = resume.json_data
      if (personalInfo) dispatch(updatePersonalInfo(personalInfo))
      if (dynamicSections) dispatch(updateSections(dynamicSections))
      navigate('/builder')
    }
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div className="text-red-600">Failed to load resumes</div>

  return (
    <>
      <SEO 
        title="My Resumes - Manage Your Saved Resumes"
        description="Access and manage all your saved resumes. Edit, update, or create new versions of your professional resumes with Write Yourself."
        keywords="saved resumes, resume management, my resumes, resume library, resume history"
      />
      <div>
      {!resumes || resumes.length === 0 ? (
        <p className="text-gray-500">No saved resumes yet.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold">Title</th>
              <th className="text-left py-3 px-4 font-semibold">Created</th>
              <th className="text-left py-3 px-4 font-semibold">Updated</th>
              <th className="text-right py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((resume) => (
              <tr key={resume.id} className="border-b hover:bg-gray-50/50">
                <td className="py-3 px-4">
                  <span className="font-medium">{resume.title || 'Untitled'}</span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(resume.created_at).toLocaleString(undefined, {
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="py-3 px-4 text-sm text-gray-600">
                  {new Date(resume.updated_at).toLocaleString(undefined, {
                    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
                <td className="py-3 px-4 text-right">
                  <Button 
                    size="sm" 
                    onClick={() => handleOpen(resume)}
                    className="ml-auto"
                  >
                    Open
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      </div>
    </>
  )
}
