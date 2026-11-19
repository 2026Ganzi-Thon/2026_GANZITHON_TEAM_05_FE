import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { Page, Heading } from '@/features/outings/components'
import { PATHS } from '@/constants/paths'
import '@/features/outings/letit.css'
export default function ReflectionFrame({
  title,
  description,
  node,
  children,
}: {
  title: string
  description?: string
  node: string
  children: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <div className="lt-app">
      <Page nodeId={node} onBack={() => navigate(PATHS.REFLECTION)}>
        <Heading title={title} subtitle={description} />
        {children}
      </Page>
    </div>
  )
}
