import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'

export function NotFoundPage() {
  const navigate = useNavigate()
  return (
    <EmptyState
      title="Page not found"
      description="That link does not exist in the marketplace."
      actionLabel="Go home"
      onAction={() => navigate('/')}
    />
  )
}
