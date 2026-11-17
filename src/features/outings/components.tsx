import SharedButton from '@/components/ui/Button'
import { OptionItem } from '@/components/ui/OptionList'
import InfoTable from '@/components/ui/InfoTable'
import TextField from '@/components/ui/TextField'
import SharedModal from '@/components/ui/Modal'
import SharedScreen from '@/components/layout/Screen'
import PageTitle from '@/components/layout/PageTitle'
import TopNav, { TopNavTextButton } from '@/components/layout/TopNav'
import { useId, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { assets } from './assets'
import type { Place } from './types'

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'text' }) {
  return (
    <SharedButton
      variant={variant}
      className={`lt-button lt-button--${variant} ${className}`}
      {...props}
    >
      <span className="lt-trim">{children}</span>
    </SharedButton>
  )
}

export function StatusBar() {
  return (
    <div className="lt-status" aria-hidden="true">
      <span>9:41</span>
      <img src={assets.statusIcons} alt="" />
    </div>
  )
}
export function TopBar({ onBack, onSkip }: { onBack: () => void; onSkip?: () => void }) {
  return (
    <div className="lt-topbar">
      <StatusBar />
      <TopNav
        className="lt-feature-topnav"
        onBack={onBack}
        right={
          onSkip ? <TopNavTextButton onClick={onSkip}>모두 건너뛰기</TopNavTextButton> : undefined
        }
      />
    </div>
  )
}

export function Page({
  children,
  footer,
  onBack,
  onSkip,
  nodeId,
}: {
  children: ReactNode
  footer?: ReactNode
  onBack: () => void
  onSkip?: () => void
  nodeId: string
}) {
  return (
    <div className="lt-page-frame" data-figma-node={nodeId}>
      <SharedScreen
        key={nodeId}
        frameClassName="lt-screen"
        className="lt-scroll"
        header={<TopBar onBack={onBack} onSkip={onSkip} />}
        bottom={footer}
        bottomClassName="lt-footer-host"
      >
        {children}
      </SharedScreen>
    </div>
  )
}

export function Footer({
  children,
  row = false,
  compact = false,
}: {
  children: ReactNode
  row?: boolean
  compact?: boolean
}) {
  return (
    <footer
      className={`lt-footer${row ? 'lt-footer--row' : ''}${compact ? 'lt-footer--compact' : ''}`}
    >
      {children}
    </footer>
  )
}
export function Heading({
  title,
  subtitle,
  eyebrow,
  progress,
}: {
  title: string
  subtitle?: string
  eyebrow?: string
  progress?: { current: number; total: number }
}) {
  return (
    <PageTitle
      title={title}
      description={subtitle}
      eyebrow={eyebrow}
      progress={progress}
      className="lt-heading"
    />
  )
}

export function Card({
  title,
  description,
  children,
  className = '',
}: {
  title?: string
  description?: string
  children?: ReactNode
  className?: string
}) {
  return (
    <section className={`lt-card ${className}`}>
      {(title || description) && (
        <div className="lt-card-copy">
          {title && <h2 className="lt-trim">{title}</h2>}
          {description && <p className="lt-trim">{description}</p>}
        </div>
      )}
      {children}
    </section>
  )
}
export function Choices({
  options,
  selected,
  onChange,
  multiple = false,
  large = false,
  label,
}: {
  options: readonly string[]
  selected: number[]
  onChange: (index: number) => void
  multiple?: boolean
  large?: boolean
  label: string
}) {
  return (
    <div
      className={`lt-choices${large ? 'lt-choices--large' : ''}`}
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={label}
    >
      {options.map((text, i) => (
        <OptionItem
          key={`${text}-${i}`}
          label={text}
          checked={selected.includes(i)}
          multiple={multiple}
          onClick={() => onChange(i)}
          indicator={
            <img src={selected.includes(i) ? assets.radioSelected : assets.radioEmpty} alt="" />
          }
        />
      ))}
    </div>
  )
}

export function NumberedSteps({
  steps,
  checked,
  title,
  compact = false,
}: {
  steps: string[]
  checked?: number[]
  title?: string
  compact?: boolean
}) {
  return (
    <Card title={title} className="lt-step-card">
      <ol className={`lt-numbered${compact ? 'lt-numbered--compact' : ''}`}>
        {steps.map((step, i) => (
          <li className={checked && !checked.includes(i) ? 'is-faded' : ''} key={step}>
            <span className="lt-step-number">{i + 1}</span>
            <span className="lt-trim">{step}</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}
export function MissionChecks({
  steps,
  checked,
  onToggle,
}: {
  steps: string[]
  checked: number[]
  onToggle: (index: number) => void
}) {
  return (
    <div className="lt-mission-checks" role="group" aria-label="미션 수행 단계">
      {steps.map((step, i) => (
        <label className={`lt-mission-check${checked.includes(i) ? 'is-checked' : ''}`} key={step}>
          <input type="checkbox" checked={checked.includes(i)} onChange={() => onToggle(i)} />
          {checked.includes(i) ? (
            <img src={assets.stepChecked} alt="" />
          ) : (
            <span className="lt-square" />
          )}
          <span className="lt-trim">{step}</span>
        </label>
      ))}
    </div>
  )
}
export function InfoRows({ rows }: { rows: [string, string][] }) {
  return (
    <InfoTable className="lt-info-rows" rows={rows.map(([label, value]) => ({ label, value }))} />
  )
}

export function Metrics({
  distance,
  time,
  budget,
}: {
  distance: string
  time: string
  budget: string
}) {
  return (
    <dl className="lt-metrics">
      {[
        ['거리', distance],
        ['소요 시간', time],
        ['금액', budget],
      ].map(([label, value]) => (
        <div key={label}>
          <dt className="lt-trim">{label}</dt>
          <dd className="lt-trim">{value}</dd>
        </div>
      ))}
    </dl>
  )
}
export function MockMap({
  park = false,
  twoPlaces = false,
  selected = 0,
  onSelect,
}: {
  park?: boolean
  twoPlaces?: boolean
  selected?: number
  onSelect?: (index: number) => void
}) {
  return (
    <div className={`lt-map${park ? 'lt-map--park' : ''}`} aria-label="주변 장소 목업 지도">
      <div className="lt-map-crop">
        <img className="lt-map-image" src={assets.map} alt="서울 강남구의 주변 장소 지도" />
      </div>
      <div className="lt-map-cone">
        <img src={assets.locationCone} alt="" />
      </div>
      <img className="lt-map-dot" src={assets.locationDot} alt="현재 위치" />
      <button
        className={`lt-map-marker lt-map-marker--one${selected === 0 ? 'is-selected' : ''}`}
        onClick={() => onSelect?.(0)}
        aria-label="첫 번째 장소 선택"
        type="button"
      >
        1
      </button>
      {twoPlaces && (
        <button
          className={`lt-map-marker lt-map-marker--two${selected === 1 ? 'is-selected' : ''}`}
          onClick={() => onSelect?.(1)}
          aria-label="두 번째 장소 선택"
          type="button"
        >
          2
        </button>
      )}
    </div>
  )
}
export function PlaceInfo({ place, park = false }: { place: Place; park?: boolean }) {
  return (
    <section className="lt-place-info">
      <div className="lt-place-copy">
        <h2 className="lt-trim">장소 정보</h2>
        <p className="lt-trim">{place.address}</p>
      </div>
      <MockMap park={park} />
    </section>
  )
}
export function ReviewInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string
  value: string
  placeholder: string
  onChange: (value: string) => void
}) {
  return (
    <TextField
      className="lt-field"
      label={label}
      value={value}
      placeholder={placeholder}
      onChange={onChange}
      maxLength={200}
      autoComplete="off"
    />
  )
}

export function Modal({
  title,
  description,
  children,
  onClose,
  actions,
  nodeId,
}: {
  title: string
  description: string
  children?: ReactNode
  onClose: () => void
  actions: ReactNode
  nodeId: string
}) {
  const titleId = useId()
  return (
    <>
      <div className="lt-modal-underlay" data-figma-node={nodeId}>
        <StatusBar />
      </div>
      <SharedModal
        open
        onClose={onClose}
        className="lt-app lt-modal-host"
        labelledBy={titleId}
        describedBy={`${titleId}-description`}
      >
        <div className="lt-modal-copy">
          <h2 className="lt-trim" id={titleId}>
            {title}
          </h2>
          <p className="lt-trim" id={`${titleId}-description`}>
            {description}
          </p>
        </div>
        {children}
        <div className="lt-modal-actions">{actions}</div>
      </SharedModal>
    </>
  )
}
