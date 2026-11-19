import Button from '@/components/ui/Button'
import { apiErrorMessage } from '@/api/errors'
import MissionSkeletons from './MissionSkeletons'
export default function ApiFeedback({
  loading = false,
  error,
  onRetry,
  title,
  children,
  places = false,
}: {
  loading?: boolean
  error?: unknown
  onRetry?: () => void
  title?: string
  children?: React.ReactNode
  places?: boolean
}) {
  if (loading) return <MissionSkeletons places={places} />
  return (
    <div className="lt-body">
      <section className="lt-card" role={error ? 'alert' : undefined}>
        <div className="lt-card-copy">
          <h2 className="lt-trim">{title ?? '잠시 후 다시 시도해 주세요'}</h2>
          {error ? <p className="lt-trim">{apiErrorMessage(error)}</p> : null}
        </div>
        {onRetry && <Button onClick={onRetry}>다시 시도하기</Button>}
        {children}
      </section>
    </div>
  )
}
